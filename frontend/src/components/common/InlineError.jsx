import { AlertCircle, RefreshCcw } from "lucide-react";
import { getFriendlyError } from "../../lib/errors";

export default function InlineError({ error, title = "Unable to load this section", onRetry }) {
  return (
    <div className="rounded-[28px] border border-rose-100 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
            <AlertCircle size={22} />
          </span>
          <div>
            <h3 className="text-lg font-black text-slate-950">{title}</h3>
            <p className="mt-1 font-semibold leading-6 text-slate-500">
              {getFriendlyError(error, "Please try again in a moment.")}
            </p>
          </div>
        </div>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 font-black text-white"
          >
            <RefreshCcw size={16} />
            Retry
          </button>
        ) : null}
      </div>
    </div>
  );
}
