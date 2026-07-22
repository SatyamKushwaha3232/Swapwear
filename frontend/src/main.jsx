import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/common/ErrorBoundary";
import NetworkStatus from "./components/common/NetworkStatus";
import "./index.css";

document.documentElement.classList.add("swapwear-js-ready");

window.addEventListener("vite:preloadError", () => {
  const retryKey = "swapwear_preload_retry";
  const alreadyRetried = sessionStorage.getItem(retryKey);

  if (!alreadyRetried) {
    sessionStorage.setItem(retryKey, "1");
    window.location.reload();
    return;
  }

  sessionStorage.removeItem(retryKey);
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <AuthProvider>
      <BrowserRouter>
        <App />
        <NetworkStatus />
        <Toaster
          position="top-center"
          toastOptions={{ duration: 2500 }}
        />
      </BrowserRouter>
    </AuthProvider>
  </ErrorBoundary>
);
