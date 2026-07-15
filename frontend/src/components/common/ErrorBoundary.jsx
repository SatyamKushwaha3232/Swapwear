import { Component } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { getFriendlyError } from "../../lib/errors";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error("SwapWear crashed:", error, info);
    }
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,59,166,0.12),transparent_34%),linear-gradient(135deg,#fff7fb,#ffffff_45%,#f8fbff)] px-5 py-10">
        <section className="mx-auto flex min-h-[72vh] max-w-3xl items-center justify-center">
          <div className="w-full rounded-[32px] border border-pink-100 bg-white/85 p-8 text-center shadow-[0_32px_100px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 text-rose-500">
              <AlertTriangle size={30} />
            </div>
            <h1 className="mt-6 text-3xl font-black text-slate-950 sm:text-5xl">
              Something needs a quick refresh.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base font-semibold leading-7 text-slate-500">
              {getFriendlyError(this.state.error, "SwapWear hit a temporary issue. Your data is safe.")}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={this.handleRetry}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-7 font-black text-white shadow-[0_18px_40px_rgba(15,23,42,0.2)]"
              >
                <RefreshCcw size={18} />
                Try again
              </button>
              <button
                type="button"
                onClick={() => window.location.assign("/")}
                className="inline-flex h-12 items-center justify-center rounded-full border border-pink-100 bg-white px-7 font-black text-slate-950"
              >
                Go home
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }
}
