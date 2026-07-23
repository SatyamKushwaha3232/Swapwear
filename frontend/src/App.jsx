import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AuthLayout from "./components/layout/AuthLayout";

const Home = lazy(() => import("./pages/Home"));
const Explore = lazy(() => import("./pages/Explore"));
const ItemDetails = lazy(() => import("./pages/ItemDetails"));
const AddListing = lazy(() => import("./pages/AddListing"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const SwapRequests = lazy(() => import("./pages/SwapRequests"));
const SwapDealRoom = lazy(() => import("./pages/SwapDealRoom"));
const Chat = lazy(() => import("./pages/Chat"));
const Community = lazy(() => import("./pages/Community"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Settings = lazy(() => import("./pages/Settings"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));

function RouteFallback() {
  return (
    <section className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-pink-100 border-t-pink-500" />
        <p className="mt-5 text-xl font-black text-slate-700">Loading SwapWear...</p>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
       {/* Auth pages - no navbar/footer */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

      {/* Main website */}
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/item/:id" element={<ItemDetails />} />


        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-listing"
          element={
            <ProtectedRoute>
              <AddListing />
            </ProtectedRoute>
          }
        />

        <Route
          path="/swaps"
          element={
            <ProtectedRoute>
              <SwapRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-listing/:listingId"
          element={
            <ProtectedRoute>
              <AddListing />
            </ProtectedRoute>
          }
        />

        <Route
          path="/swaps/:swapId"
          element={
            <ProtectedRoute>
              <SwapDealRoom />
            </ProtectedRoute>
          }
        />

        <Route
          path="/community"
          element={<Community />}
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat/:conversationId"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <Admin />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />

      </Route>
    </Routes>
    </Suspense>
  );
}
