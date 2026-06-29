import { useEffect, useState } from "react";

import {
  Check,
  X,
  Clock,
  ArrowRight,
  MessageCircle,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

import SectionTitle from "../components/common/SectionTitle";

import {
  getSwapRequests,
  acceptSwap,
  declineSwap,
} from "../services/swaps";

export default function SwapRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadRequests() {
    setLoading(true);

    const response = await getSwapRequests();

    if (response.success) {
      setRequests(response.data);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function handleAccept(id) {
    const response = await acceptSwap(id);

    if (!response.success) {
      alert(response.error);
      return;
    }

    loadRequests();
  }

  async function handleDecline(id) {
    const response = await declineSwap(id);

    if (!response.success) {
      alert(response.error);
      return;
    }

    loadRequests();
  }

  return (
    <section className="section-space pt-28">
      <div className="container-main">

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">

          <SectionTitle
            badge="Swap Management"
            title={
              <>
                Review swap
                <br />
                requests clearly.
              </>
            }
            description="Compare wanted and offered items side-by-side, negotiate, and finalize fair exchanges."
          />

          <div className="bg-white/55 backdrop-blur-2xl rounded-[34px] border border-white/50 shadow-[0_20px_70px_rgba(15,23,42,0.08)] p-6 min-w-[270px]">

            <p className="text-sm font-black text-[var(--muted)]">
              Total Requests
            </p>

            <h3 className="mt-2 text-5xl font-black">
              {requests.length}
            </h3>

            <p className="mt-2 text-[var(--muted)] font-semibold">
              marketplace requests
            </p>

          </div>

        </div>

        <div className="mt-12 space-y-8">

          {loading ? (

            <div className="space-y-8">

              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="h-[420px] rounded-[42px] bg-white/40 animate-pulse"
                />
              ))}

            </div>

          ) : requests.length === 0 ? (

            <div className="rounded-[42px] bg-white/55 backdrop-blur-2xl border border-white/50 p-14 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)]">

              <h3 className="text-4xl font-black">
                No swap requests yet
              </h3>

              <p className="mt-4 text-[var(--muted)] font-semibold">
                Send requests from item pages to see them here.
              </p>

            </div>

          ) : (

            requests.map((request) => {
              const difference = Math.abs(
                Number(request.owner_points || 0) -
                  Number(request.requester_points || 0)
              );

              return (
                <article
                  key={request.id}
                  className="bg-white/55 backdrop-blur-2xl rounded-[42px] border border-white/50 shadow-[0_24px_80px_rgba(15,23,42,0.08)] p-6 md:p-8"
                >

                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                    <div className="flex items-center gap-4">

                      <div className="w-14 h-14 rounded-full bg-[var(--accent-soft)] border border-white/50 flex items-center justify-center font-black text-[var(--accent)]">
                        {request.requester_name?.charAt(0)}
                      </div>

                      <div>

                        <h3 className="text-2xl font-black">
                          {request.requester_name}
                        </h3>

                        <p className="text-[var(--muted)] font-semibold">
                          wants to swap with you
                        </p>

                      </div>

                    </div>

                    <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[var(--yellow-soft)] text-[#8a5a00] font-black w-fit">

                      <Clock size={17} />

                      {request.status}

                    </div>

                  </div>

                  <div className="mt-8 grid lg:grid-cols-[1fr_auto_1fr] gap-6 items-center">

                    {/* OWNER ITEM */}
                    <div className="rounded-[34px] bg-white/45 backdrop-blur-xl border border-white/50 p-4">

                      <p className="px-4 py-2 rounded-full bg-white/60 text-[var(--muted)] font-black text-sm w-fit">
                        Wants your item
                      </p>

                      <div className="mt-5 flex gap-5">

                        <img
                          src={request.owner_item_image}
                          alt=""
                          className="w-32 h-40 rounded-[26px] object-cover shadow-lg"
                        />

                        <div className="flex-1">

                          <h4 className="text-2xl font-black leading-tight">
                            {request.owner_item_title}
                          </h4>

                          <p className="mt-4 text-3xl font-black text-[var(--accent)]">
                            {request.owner_points}
                          </p>

                          <p className="text-[var(--muted)] font-bold">
                            swap points
                          </p>

                        </div>

                      </div>

                    </div>

                    <div className="flex justify-center">

                      <div className="w-16 h-16 rounded-full bg-pink-400/35 backdrop-blur-xl border border-white/50 flex items-center justify-center shadow-[0_12px_34px_rgba(255,105,180,0.18)]">

                        <ArrowRight size={26} />

                      </div>

                    </div>

                    {/* REQUESTER ITEM */}
                    <div className="rounded-[34px] bg-white/45 backdrop-blur-xl border border-white/50 p-4">

                      <p className="px-4 py-2 rounded-full bg-white/60 text-[var(--muted)] font-black text-sm w-fit">
                        Offers you
                      </p>

                      <div className="mt-5 flex gap-5">

                        <img
                          src={request.requester_item_image}
                          alt=""
                          className="w-32 h-40 rounded-[26px] object-cover shadow-lg"
                        />

                        <div className="flex-1">

                          <h4 className="text-2xl font-black leading-tight">
                            {request.requester_item_title}
                          </h4>

                          <p className="mt-4 text-3xl font-black text-[var(--accent)]">
                            {request.requester_points}
                          </p>

                          <p className="text-[var(--muted)] font-bold">
                            swap points
                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                  <div className="mt-6 rounded-[30px] bg-pink-400/18 backdrop-blur-xl border border-white/50 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                    <div className="flex items-center gap-3">

                      <div className="w-12 h-12 rounded-full bg-white/60 text-[var(--accent)] flex items-center justify-center">

                        <Sparkles size={20} />

                      </div>

                      <div>

                        <h4 className="font-black">
                          Swap value insight
                        </h4>

                        <p className="text-[var(--muted)] font-semibold">
                          Compare points before accepting.
                        </p>

                      </div>

                    </div>

                    <p className="font-black text-[var(--accent)]">
                      Difference: {difference} pts
                    </p>

                  </div>

                  <div className="mt-7 flex flex-col sm:flex-row gap-4">

                    <button
                      onClick={() => handleAccept(request.id)}
                      className="flex-1 h-14 rounded-full bg-pink-400/35 backdrop-blur-xl border border-white/50 font-black flex items-center justify-center gap-2 hover:bg-pink-400/50 transition shadow-[0_12px_34px_rgba(255,105,180,0.18)]"
                    >

                      <Check size={19} />

                      Accept Swap

                    </button>

                    <button className="flex-1 h-14 rounded-full bg-white/55 backdrop-blur-xl border border-white/50 font-black flex items-center justify-center gap-2 hover:bg-pink-400/20 transition">

                      <MessageCircle size={19} />

                      Negotiate

                    </button>

                    <button
                      onClick={() => handleDecline(request.id)}
                      className="flex-1 h-14 rounded-full bg-[var(--red-soft)] text-[var(--red)] font-black flex items-center justify-center gap-2"
                    >

                      <X size={19} />

                      Decline

                    </button>

                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">

                    <span className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/55 border border-white/50 font-black">

                      <ShieldCheck
                        size={17}
                        className="text-[var(--green)]"
                      />

                      Verified Users

                    </span>

                    <span className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/55 border border-white/50 font-black">

                      <Clock
                        size={17}
                        className="text-[var(--accent)]"
                      />

                      Live Marketplace Request

                    </span>

                  </div>

                </article>
              );
            })

          )}

        </div>
      </div>
    </section>
  );
}
