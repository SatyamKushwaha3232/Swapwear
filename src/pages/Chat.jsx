import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  Send,
  Paperclip,
  ImagePlus,
  Phone,
  Video,
  MoreHorizontal,
  Circle,
  Search,
  ShieldCheck,
  Repeat2,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { getCurrentProfile } from "../services/profile";

export default function Chat() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "SwapWear User";

  useEffect(() => {
    async function loadProfile() {
      const response = await getCurrentProfile();
      if (response.success) setProfile(response.data);
    }

    loadProfile();
  }, []);

  useEffect(() => {
    async function loadMessages() {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        toast.error(error.message);
        return;
      }

      setMessages(data || []);
    }

    loadMessages();

    const channel = supabase
      .channel("swapwear-chat-room")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim()) return;

    const messageText = input.trim();
    setInput("");

    const { error } = await supabase.from("messages").insert([
      {
        sender_name: displayName,
        receiver_name: "SwapWear Community",
        message: messageText,
      },
    ]);

    if (error) {
      toast.error(error.message);
      setInput(messageText);
    }
  }

  return (
    <section className="section-space pt-28">
      <div className="container-main">
        <div className="mb-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-pink-400/20 backdrop-blur-xl border border-white/50 text-[var(--accent)] font-black">
            <Repeat2 size={16} />
            Negotiation Chat
          </div>

          <h1 className="mt-6 text-5xl md:text-6xl xl:text-7xl font-black tracking-[-3px] leading-[1]">
            Chat before you swap.
          </h1>

          <p className="mt-5 text-xl text-[var(--muted)] leading-relaxed">
            Discuss swap details, delivery, condition, and pricing before finalizing.
          </p>
        </div>

        <div className="grid xl:grid-cols-[390px_1fr] gap-8">
          <aside className="bg-white/55 backdrop-blur-2xl rounded-[42px] border border-white/50 shadow-[0_24px_80px_rgba(15,23,42,0.08)] overflow-hidden">
            <div className="p-7 border-b border-white/50">
              <h2 className="text-4xl font-black">Messages</h2>
              <p className="mt-2 text-[var(--muted)] font-semibold">
                Live marketplace chat
              </p>

              <div className="mt-6 h-14 rounded-full bg-white/55 backdrop-blur-xl border border-white/50 flex items-center px-5">
                <Search size={18} className="text-[var(--muted)]" />
                <input
                  placeholder="Search chats..."
                  className="w-full bg-transparent outline-none px-3"
                />
              </div>
            </div>

            <div className="p-4">
              <div className="p-4 rounded-[30px] bg-pink-400/20 border border-pink-300/30 shadow-[0_12px_34px_rgba(255,105,180,0.14)]">
                <div className="flex items-center gap-4">
                  <div className="relative w-15 h-15 rounded-full bg-white/60 border border-white/50 shrink-0">
                    <div className="absolute inset-2 rounded-full bg-[var(--accent-soft)]" />
                    <span className="absolute right-0 bottom-1 w-3.5 h-3.5 rounded-full bg-[var(--green)] border-2 border-white" />
                  </div>
                  <div>
                    <h3 className="font-black">SwapWear Community</h3>
                    <p className="text-sm text-[var(--muted)] font-semibold">
                      Marketplace negotiations
                    </p>
                    <p className="text-sm text-[var(--muted)]">
                      Live conversation
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="bg-white/55 backdrop-blur-2xl rounded-[42px] border border-white/50 shadow-[0_24px_80px_rgba(15,23,42,0.08)] overflow-hidden flex flex-col min-h-[760px]">
            <div className="p-6 border-b border-white/50 flex items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full bg-[var(--accent-soft)] border border-white/50 overflow-hidden">
                  {profile?.avatar_url && (
                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  )}
                  <span className="absolute right-1 bottom-1 w-4 h-4 rounded-full bg-[var(--green)] border-2 border-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black">SwapWear Community</h2>
                  <p className="flex items-center gap-2 text-[var(--green)] font-black text-sm">
                    <Circle size={8} fill="currentColor" />
                    Online now
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {[Phone, Video, MoreHorizontal].map((Icon, index) => (
                  <button
                    key={index}
                    className="w-12 h-12 rounded-full bg-white/55 backdrop-blur-xl border border-white/50 flex items-center justify-center hover:bg-pink-400/20 transition"
                  >
                    <Icon size={19} />
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 border-b border-white/50">
              <div className="rounded-[32px] bg-white/45 backdrop-blur-xl border border-white/50 p-4 flex items-center gap-4">
                <img
                  src="https://images.unsplash.com/photo-1543076447-215ad9ba6923?q=80&w=500&auto=format&fit=crop"
                  alt=""
                  className="w-22 h-26 rounded-[24px] object-cover shadow-lg"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--muted)] font-black">
                    Negotiating for
                  </p>
                  <h3 className="text-xl font-black mt-1 truncate">
                    Fashion Swap Deal
                  </h3>
                  <p className="text-[var(--accent)] font-black mt-1">
                    Discuss points, pickup, and condition
                  </p>
                </div>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--green-soft)] text-[var(--green)] font-black">
                  <ShieldCheck size={16} />
                  Verified
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 space-y-5 overflow-y-auto bg-gradient-to-b from-white/20 to-pink-50/30">
              {messages.length === 0 && (
                <div className="rounded-[30px] bg-white/55 border border-white/50 p-6 text-center">
                  <h3 className="text-2xl font-black">No messages yet</h3>
                  <p className="mt-2 text-[var(--muted)] font-semibold">
                    Start the conversation below.
                  </p>
                </div>
              )}

              {messages.map((msg) => {
                const mine = msg.sender_name === displayName;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[78%] rounded-[30px] px-5 py-4 shadow-sm backdrop-blur-xl border ${
                        mine
                          ? "bg-pink-400/35 border-white/50 rounded-br-md"
                          : "bg-white/65 border-white/50 rounded-bl-md"
                      }`}
                    >
                      <p className="leading-relaxed font-medium">{msg.message}</p>
                      <span className="text-xs mt-2 block text-[var(--muted)] font-semibold">
                        {msg.sender_name}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <div className="p-5 border-t border-white/50 bg-white/35 backdrop-blur-xl">
              <div className="h-16 rounded-full bg-white/55 backdrop-blur-xl border border-white/50 flex items-center gap-3 px-4 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
                <button className="w-11 h-11 rounded-full bg-white/60 border border-white/50 flex items-center justify-center">
                  <Paperclip size={19} />
                </button>
                <button className="w-11 h-11 rounded-full bg-white/60 border border-white/50 flex items-center justify-center">
                  <ImagePlus size={19} />
                </button>
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage();
                  }}
                  className="flex-1 bg-transparent outline-none min-w-0"
                />
                <button
                  onClick={sendMessage}
                  className="w-12 h-12 rounded-full bg-pink-400/35 border border-white/50 flex items-center justify-center shadow-[0_12px_34px_rgba(255,105,180,0.20)] hover:bg-pink-400/50 transition"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
