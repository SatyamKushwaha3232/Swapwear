import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";

const EMPTY_VALUES = Object.freeze({});

export default function ActionDialog({
  open,
  title,
  text,
  tone = "default",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  fields = [],
  initialValues = EMPTY_VALUES,
  loading = false,
  onClose,
  onConfirm,
}) {
  const [values, setValues] = useState(initialValues);

  useEffect(() => {
    if (open) setValues(initialValues || {});
  }, [initialValues, open]);

  if (!open) return null;

  const danger = tone === "danger";
  const Icon = danger ? AlertTriangle : CheckCircle2;

  function submit(event) {
    event.preventDefault();
    onConfirm?.(values);
  }

  return (
    <div className="fixed inset-0 z-[1400] flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-slate-950/45 backdrop-blur-sm"
      />

      <form
        onSubmit={submit}
        className="premium-surface relative w-full max-w-[520px] rounded-[34px] p-5 shadow-[0_36px_120px_rgba(15,23,42,0.24)] md:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <div
              className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl ${
                danger ? "bg-red-50 text-red-600" : "bg-pink-50 text-pink-500"
              }`}
            >
              <Icon size={23} />
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-black leading-tight text-slate-950">
                {title}
              </h2>
              {text && (
                <p className="mt-2 font-semibold leading-relaxed text-slate-500">
                  {text}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/80 text-slate-500 shadow-sm transition hover:bg-pink-50 hover:text-pink-500"
          >
            <X size={19} />
          </button>
        </div>

        {fields.length > 0 && (
          <div className="mt-5 grid gap-3">
            {fields.map((field) => {
              const commonProps = {
                value: values[field.name] || "",
                onChange: (event) =>
                  setValues((current) => ({
                    ...current,
                    [field.name]: event.target.value,
                  })),
                placeholder: field.placeholder || "",
                className:
                  "mt-2 w-full rounded-[22px] border border-pink-100 bg-white/82 px-4 py-3 font-semibold outline-none transition focus:border-pink-300",
              };

              return (
                <label key={field.name} className="block">
                  <span className="text-sm font-black text-slate-500">
                    {field.label}
                  </span>
                  {field.type === "textarea" ? (
                    <textarea {...commonProps} rows={field.rows || 4} />
                  ) : (
                    <input {...commonProps} />
                  )}
                </label>
              );
            })}
          </div>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onClose}
            className="h-12 rounded-full bg-white/85 font-black text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            {cancelLabel}
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`h-12 rounded-full px-5 font-black text-white shadow-lg transition disabled:opacity-60 ${
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gradient-to-br from-pink-500 via-fuchsia-500 to-violet-500 hover:brightness-105"
            }`}
          >
            {loading ? "Working..." : confirmLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
