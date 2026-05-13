interface AsyncStateProps {
  message: string;
}

export function LoadingState({ message }: AsyncStateProps) {
  return <div className="card text-xs font-bold text-bal-text-muted">{message}</div>;
}

export function EmptyState({ message }: AsyncStateProps) {
  return <div className="card text-xs font-bold text-bal-text-muted">{message}</div>;
}

export function ErrorState({ message }: AsyncStateProps) {
  return (
    <div className="card border-bal-danger/30 bg-bal-danger/[0.03] text-bal-danger text-sm font-bold">
      {message}
    </div>
  );
}
