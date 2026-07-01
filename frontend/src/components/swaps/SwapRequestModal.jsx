import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  MessageCircle,
  PackageSearch,
  Repeat2,
  Send,
  Sparkles,
  X,
} from "lucide-react";

import { getListings } from "../../services/listings";
import { getCurrentProfile } from "../../services/profile";
import { createSwapRequest } from "../../services/swaps";

export default function SwapRequestModal({
  open,
  onClose,
  user,
  ownerItem,
  onSuccess,
}) {
  const [myListings, setMyListings] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [message, setMessage] = useState("");
  const [loadingListings, setLoadingListings] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function loadMyListings() {
      if (!open || !user?.id) return;

      setLoadingListings(true);

      const response = await getListings(user.id);

      if (response.success) {
        const listings = response.data || [];
        setMyListings(listings);
        setSelectedItem(listings[0] || null);
      } else {
        toast.error(response.error || "Unable to load your listings");
      }

      setLoadingListings(false);
    }

    loadMyListings();
  }, [open, user?.id]);

  if (!open) return null;

  async function handleSendRequest() {
    if (!user?.id) {
      toast.error("Please login first");
      return;
    }

    if (!selectedItem) {
      toast.error("Please select one of your listings");
      return;
    }

    if (ownerItem?.ownerId && String(ownerItem.ownerId) === String(user.id)) {
      toast.error("You cannot request swap on your own item");
      return;
    }

    setSending(true);

    const profileResponse = await getCurrentProfile();

    const response = await createSwapRequest({
      requesterId: user.id,
      ownerId: ownerItem.ownerId || ownerItem.user_id || null,
      requesterName:
        profileResponse.data?.full_name ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "SwapWear User",
      ownerName: ownerItem.owner || ownerItem.owner_name || "SwapWear User",
      requesterItem: selectedItem,
      ownerItem,
      message: message.trim(),
    });

    if (!response.success) {
      toast.error(response.error || "Unable to send swap request");
      setSending(false);
      return;
    }

    toast.success("Swap request sent");
    setSending(false);
    onSuccess?.(response.data);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
      />

      <div className="relative max-h-[92vh] w-full max-w-[980px] overflow-y-auto rounded-[36px] border border-white/70 bg-white p-5 shadow-[0_35px_100px_rgba(15,23,42,0.22)] md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-5 py-2 font-black text-pink-500">
              <Sparkles size={16} />
              Swap Request
            </div>

            <h2 className="mt-4 text-3xl font-black tracking-[-1px] md:text-4xl">
              Choose your item to offer
            </h2>

            <p className="mt-2 font-semibold text-slate-500">
              Select one of your listings and send a message to the owner.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-pink-50 text-pink-500"
          >
            <X size={22} />
          </button>
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0">
            <h3 className="mb-4 flex items-center gap-2 font-black">
              <PackageSearch size={19} className="text-pink-500" />
              Your Listings
            </h3>

            {loadingListings ? (
              <div className="rounded-[28px] bg-pink-50 p-8 text-center font-black text-pink-500">
                Loading your listings...
              </div>
            ) : myListings.length === 0 ? (
              <div className="rounded-[28px] border border-pink-100 bg-pink-50/70 p-7 text-center">
                <h4 className="text-2xl font-black">No listings found</h4>
                <p className="mt-2 font-semibold text-slate-500">
                  Add at least one listing before sending a swap request.
                </p>
              </div>
            ) : (
              <div className="grid max-h-[430px] gap-3 overflow-y-auto pr-1">
                {myListings.map((listing) => (
                  <button
                    key={listing.id}
                    type="button"
                    onClick={() => setSelectedItem(listing)}
                    className={`flex min-w-0 items-center gap-4 rounded-[26px] border p-3 text-left transition ${
                      String(selectedItem?.id) === String(listing.id)
                        ? "border-pink-500 bg-pink-50 shadow-[0_14px_34px_rgba(255,79,163,0.15)]"
                        : "border-pink-100 bg-white hover:bg-pink-50/60"
                    }`}
                  >
                    <img
                      src={listing.image || listing.images?.[0] || "/icons.svg"}
                      alt={listing.title}
                      onError={(e) => {
                        e.currentTarget.src = "/icons.svg";
                      }}
                      className="h-20 w-20 shrink-0 rounded-[20px] object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-black uppercase tracking-widest text-pink-500">
                        {listing.brand || "Brand"}
                      </p>
                      <h4 className="mt-1 truncate text-lg font-black">
                        {listing.title || "Untitled Item"}
                      </h4>
                      <p className="mt-1 truncate text-sm font-bold text-slate-500">
                        Size {listing.size || "Free"} •{" "}
                        {listing.condition || "Good"} • {listing.points || 0} pts
                      </p>
                    </div>

                    <div
                      className={`h-5 w-5 shrink-0 rounded-full border-2 ${
                        String(selectedItem?.id) === String(listing.id)
                          ? "border-pink-500 bg-pink-500"
                          : "border-slate-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-5">
              <label className="mb-2 flex items-center gap-2 font-black">
                <MessageCircle size={18} />
                Message
              </label>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                maxLength={280}
                placeholder="Hi, I’m interested in swapping this item..."
                className="w-full resize-none rounded-[26px] border border-pink-100 bg-pink-50/45 p-4 font-semibold outline-none focus:border-pink-400"
              />

              <p className="mt-2 text-right text-xs font-bold text-slate-400">
                {message.length}/280
              </p>
            </div>
          </div>

          <div className="min-w-0 rounded-[30px] border border-pink-100 bg-pink-50/70 p-5">
            <h3 className="flex items-center gap-2 font-black">
              <Repeat2 size={19} className="text-pink-500" />
              Swap Preview
            </h3>

            <PreviewCard label="You offer" item={selectedItem} />
            <PreviewCard label="You want" item={ownerItem} />

            <button
              type="button"
              disabled={sending || loadingListings || !selectedItem}
              onClick={handleSendRequest}
              className="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 font-black text-white shadow-[0_16px_36px_rgba(255,79,163,0.32)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={18} />
              {sending ? "Sending..." : "Send Request"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewCard({ label, item }) {
  const image = item?.image || item?.images?.[0] || "/icons.svg";

  return (
    <div className="mt-4 rounded-[24px] bg-white p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-widest text-pink-500">
        {label}
      </p>

      <div className="mt-3 flex min-w-0 items-center gap-3">
        <img
          src={image}
          alt={item?.title || "Item"}
          onError={(e) => {
            e.currentTarget.src = "/icons.svg";
          }}
          className="h-16 w-16 shrink-0 rounded-[18px] object-cover"
        />

        <div className="min-w-0">
          <h4 className="truncate font-black">
            {item?.title || "No item selected"}
          </h4>
          <p className="mt-1 truncate text-sm font-bold text-slate-500">
            {item?.brand || "Brand"} • {item?.points || 0} pts
          </p>
        </div>
      </div>
    </div>
  );
}