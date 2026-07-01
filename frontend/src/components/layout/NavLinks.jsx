import { NavLink } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const links = [
  { name: "Discover", path: "/" },
  { name: "Browse", path: "/explore" },
  { name: "Dashboard", path: "/dashboard" },
  { name: "Community", path: "/chat" },
];

export default function NavLinks({ onCategories }) {
  return (
    <nav className="hidden shrink-0 items-center gap-5 min-[1280px]:flex">
      {links.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `relative whitespace-nowrap text-[14px] font-black tracking-[-0.2px] transition ${
              isActive ? "text-pink-500" : "text-slate-800 hover:text-pink-500"
            }`
          }
        >
          {({ isActive }) => (
            <>
              {item.name}
              <span
                className={`absolute left-0 -bottom-2 h-[3px] rounded-full bg-pink-500 transition-all ${
                  isActive ? "w-full" : "w-0"
                }`}
              />
            </>
          )}
        </NavLink>
      ))}

      <button
        type="button"
        onClick={onCategories}
        className="flex items-center gap-1 whitespace-nowrap text-[14px] font-black text-slate-800 transition hover:text-pink-500"
      >
        Categories <ChevronDown size={16} />
      </button>
    </nav>
  );
}