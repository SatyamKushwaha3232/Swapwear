import { Link } from "react-router-dom";
import { PackagePlus } from "lucide-react";

export default function EmptyState({
  title = "No items yet",
  text = "Add your first listing and it will appear here.",
  actionLabel = "Add Listing",
  actionTo = "/add-listing",
}) {
  return (
    <div className="rounded-[32px] border border-pink-100 bg-white p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:p-12">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-pink-50 text-pink-500">
        <PackagePlus size={30} />
      </div>
      <h3 className="mt-6 text-2xl font-black text-slate-950 sm:text-3xl">{title}</h3>
      <p className="mx-auto mt-3 max-w-md font-semibold leading-7 text-slate-500">{text}</p>
      {actionTo ? (
        <Link
          to={actionTo}
          className="mt-7 inline-flex h-12 items-center rounded-full bg-slate-950 px-7 font-black text-white"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
