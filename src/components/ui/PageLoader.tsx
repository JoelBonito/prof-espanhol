export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div
        className="w-8 h-8 rounded-full border-4 border-primary-200 border-t-primary-500 animate-spin"
        role="status"
        aria-label="Carregando página"
      />
    </div>
  );
}
