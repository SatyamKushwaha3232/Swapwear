import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full border-4 border-pink-200 border-t-pink-500 animate-spin" />
          <h2 className="mt-6 text-3xl font-black">Loading SwapWear...</h2>
        </div>
      </section>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  return children;
}
