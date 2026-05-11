import json
from google import genai
from google.genai import types
from sqlalchemy.orm import Session
from agent.gemini_client import get_client
from agent.prompts import CUSTOMER_SYSTEM_PROMPT, MANAGER_SYSTEM_PROMPT
from agent.tools import (
    TOOL_DEFINITIONS,
    tool_get_order_status,
    tool_check_stock,
    tool_get_daily_summary,
    tool_predict_stockout,
    tool_notify_customers
)
from repositories.message_repo import get_messages_by_session, save_message

TOOL_FUNCTIONS = {
    "get_order_status": tool_get_order_status,
    "check_stock": tool_check_stock,
    "get_daily_summary": tool_get_daily_summary,
    "predict_stockout": tool_predict_stockout,
    "notify_customers": tool_notify_customers
}

def _execute_tool(tool_name: str, tool_args: dict, db: Session, business_id: str) -> str:
    func = TOOL_FUNCTIONS.get(tool_name)
    if not func:
        return json.dumps({"error": f"Bilinmeyen araç: {tool_name}"})
    try:
        result = func(db=db, business_id=business_id, **tool_args)
        return json.dumps(result, ensure_ascii=False, default=str)
    except Exception as e:
        return json.dumps({"error": str(e)})

def _build_history(messages: list) -> list:
    history = []
    for msg in messages:
        if msg.sender_type in ["customer", "manager"]:
            history.append(types.Content(role="user", parts=[types.Part(text=msg.content)]))
        elif msg.sender_type == "ai":
            history.append(types.Content(role="model", parts=[types.Part(text=msg.content)]))
    return history

def _build_tools(tool_list: list) -> list:
    declarations = []
    for t in tool_list:
        properties = {}
        for k, v in t["parameters"].get("properties", {}).items():
            if v["type"] == "string":
                properties[k] = types.Schema(type="STRING")
            elif v["type"] == "integer":
                properties[k] = types.Schema(type="INTEGER")
            elif v["type"] == "array":
                properties[k] = types.Schema(
                    type="ARRAY",
                    items=types.Schema(type="INTEGER")
                )
            else:
                properties[k] = types.Schema(type="STRING")

        declarations.append(types.FunctionDeclaration(
            name=t["name"],
            description=t["description"],
            parameters=types.Schema(
                type="OBJECT",
                properties=properties,
                required=t["parameters"].get("required", [])
            )
        ))
    return [types.Tool(function_declarations=declarations)]

def _run_agent(
    system_prompt: str,
    user_message: str,
    history: list,
    tools: list,
    db: Session,
    business_id: str
) -> str:
    client = get_client()
    
    contents = history + [types.Content(role="user", parts=[types.Part(text=user_message)])]
    
    max_iterations = 5
    for _ in range(max_iterations):
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                tools=tools,
                temperature=0.7,
            )
        )

        candidate = response.candidates[0]
        tool_calls = [
            part for part in candidate.content.parts
            if part.function_call is not None
        ]

        if not tool_calls:
            text_parts = [
                part.text for part in candidate.content.parts
                if part.text
            ]
            return " ".join(text_parts) if text_parts else "Anlayamadım, tekrar söyler misiniz?"

        tool_results = []
        for part in tool_calls:
            fc = part.function_call
            tool_args = dict(fc.args)
            result = _execute_tool(fc.name, tool_args, db, business_id)
            tool_results.append(types.Part(
                function_response=types.FunctionResponse(
                    name=fc.name,
                    response={"result": result}
                )
            ))

        contents.append(candidate.content)
        contents.append(types.Content(role="user", parts=tool_results))

    return "İşlem tamamlandı."

def run_customer_agent(
    db: Session,
    business_id: str,
    session_id: str,
    user_message: str,
    customer_name: str = "Müşteri"
) -> str:
    save_message(db, business_id, session_id, "customer", user_message)
    history = _build_history(
        get_messages_by_session(db, session_id, business_id, limit=10)
    )
    tools = _build_tools(TOOL_DEFINITIONS[:3])
    system = f"{CUSTOMER_SYSTEM_PROMPT}\nMüşteri adı: {customer_name}"
    
    response = _run_agent(system, user_message, history[:-1] if history else [], tools, db, business_id)
    save_message(db, business_id, session_id, "ai", response)
    return response

def run_manager_agent(
    db: Session,
    business_id: str,
    session_id: str,
    user_message: str
) -> str:
    save_message(db, business_id, session_id, "manager", user_message)
    history = _build_history(
        get_messages_by_session(db, session_id, business_id, limit=10)
    )
    tools = _build_tools(TOOL_DEFINITIONS)
    
    response = _run_agent(MANAGER_SYSTEM_PROMPT, user_message, history[:-1] if history else [], tools, db, business_id)
    save_message(db, business_id, session_id, "ai", response)
    return response