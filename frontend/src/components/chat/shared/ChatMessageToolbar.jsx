import { Pin, Search, Star } from "lucide-react";

const filters = [
  { id: "all", label: "All" },
  { id: "pinned", label: "Pinned", icon: Pin },
  { id: "starred", label: "Starred", icon: Star },
];

export default function ChatMessageToolbar({
  searchValue = "",
  onSearchChange,
  activeFilter = "all",
  onFilterChange,
  counts = {},
}) {
  return (
    <div className="border-b border-pink-100 bg-white px-4 py-3 md:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 items-center rounded-full bg-pink-50 px-4 py-3">
          <Search size={18} className="shrink-0 text-pink-500" />
          <input
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder="Search messages..."
            className="min-w-0 flex-1 bg-transparent px-3 text-sm font-bold outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-full bg-pink-50 p-1 lg:w-[300px]">
          {filters.map((filter) => {
            const Icon = filter.icon;
            const active = activeFilter === filter.id;

            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => onFilterChange?.(filter.id)}
                className={`flex h-10 min-w-0 items-center justify-center gap-1 rounded-full px-2 text-xs font-black transition ${
                  active
                    ? "bg-white text-pink-500 shadow-sm"
                    : "text-slate-500 hover:text-pink-500"
                }`}
              >
                {Icon && <Icon size={14} className="shrink-0" />}
                <span className="truncate">{filter.label}</span>
                <span className="shrink-0 opacity-70">{counts[filter.id] || 0}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}