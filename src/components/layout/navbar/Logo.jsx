import { Recycle } from "lucide-react";
import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <Link
      to="/"
      className="flex items-center gap-3"
    >
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 text-white flex items-center justify-center shadow-xl">
        <Recycle size={24} />
      </div>

      <div>
        <h1 className="text-2xl font-black tracking-tight">
          SwapWear
        </h1>

        <p className="text-xs text-gray-500">
          Sustainable Fashion
        </p>
      </div>
    </Link>
  );
}