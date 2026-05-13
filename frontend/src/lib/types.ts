export type AlertType = "warning" | "danger";

export interface DashboardAlert {
  type: AlertType;
  message: string;
}

export interface DelayedOrderSummary {
  id: number;
  customer_name: string;
  cargo_tracking_no: string | null;
  estimated_delivery: string | null;
}

export interface CriticalStockSummary {
  name: string;
  stock: number;
  critical_threshold: number;
  unit: string;
}

export interface DashboardSummaryResponse {
  total_orders_today: number;
  delayed_orders_count: number;
  delayed_orders: DelayedOrderSummary[];
  critical_stocks_count: number;
  critical_stocks: CriticalStockSummary[];
  pending_messages_count: number;
  alerts: DashboardAlert[];
}

export interface DashboardOrderResponse {
  id: number;
  customer_name: string;
  customer_phone: string | null;
  product: string | null;
  quantity: number;
  status: string;
  cargo_tracking_no: string | null;
  estimated_delivery: string | null;
  created_at: string;
}

export interface ProductResponse {
  id: number;
  name: string;
  stock: number;
  unit: string;
  price: number;
  critical_threshold: number;
  status: "KRİTİK" | "NORMAL";
}

export interface StockPredictionResponse {
  product: string;
  current_stock: number;
  unit: string;
  avg_daily_sales: number;
  days_until_stockout: number | null;
  recommended_order: number;
  status: "ACİL" | "KRİTİK" | "NORMAL" | "VERİ YOK";
  message?: string;
  error?: string;
}

export interface ManagerChatResponse {
  reply: string;
  session_id: string;
}

export interface CustomerChatResponse {
  reply: string;
  session_id: string;
}

export interface CustomerSessionSummary {
  session_id: string;
  title?: string;
  last_message: string;
  created_at: string;
}

export interface ChatMessageItem {
  id?: number;
  sender_type: "customer" | "manager" | "ai";
  content: string;
  message_type?: "customer_to_ai" | "manager_to_customer" | "manager_to_ai";
  created_at?: string;
}
