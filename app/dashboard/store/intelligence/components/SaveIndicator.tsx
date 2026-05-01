"use client";

type SaveIndicatorProps = {
  isOnline: boolean;
  isSaving: boolean;
  error: string | null;
  message: string;
  onRetry: () => void | Promise<unknown>;
};

function boxTone(isOnline: boolean, isSaving: boolean, error: string | null) {
  if (!isOnline) return "border-amber-200 bg-amber-50 text-amber-800";
  if (error) return "border-rose-200 bg-rose-50 text-rose-700";
  if (isSaving) return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

export function SaveIndicator({
  isOnline,
  isSaving,
  error,
  message,
  onRetry,
}: SaveIndicatorProps) {
  const tone = boxTone(isOnline, isSaving, error);

  return (
    <div
      className={`rounded-[1.5rem] border px-4 py-3 text-sm shadow-sm ${tone}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>
          {!isOnline
            ? "Offline: as alterações ficam salvas neste dispositivo até a conexão voltar."
            : message}
        </span>

        {isOnline && error ? (
          <button
            type="button"
            onClick={() => void onRetry()}
            className="inline-flex shrink-0 rounded-2xl border border-current px-3 py-2 text-xs font-semibold transition hover:bg-white/60"
          >
            Tentar novamente
          </button>
        ) : null}
      </div>
    </div>
  );
}