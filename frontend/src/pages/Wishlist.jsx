import { useEffect, useState } from "react";
import { Heart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";
import { getWishlist, removeWishlist } from "../services/wishlist";
import { getListings } from "../services/listings";

export default function Wishlist() {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadWishlist() {
    if (!user) return;

    setLoading(true);

    const wishlist = await getWishlist(user.id);
    const listings = await getListings();

    const merged = wishlist
      .map((wish) => {
        const listing = listings.data.find(
          (item) => item.id === wish.listing_id
        );

        return listing
          ? {
              ...listing,
              wishlistId: wish.id,
            }
          : null;
      })
      .filter(Boolean);

    setItems(merged);
    setLoading(false);
  }

  useEffect(() => {
    loadWishlist();
  }, [user]);

  async function handleRemove(id) {
    const response = await removeWishlist(id);

    if (response.success) {
      toast.success("Removed from wishlist");
      loadWishlist();
    }
  }

  return (
    <section className="section-space pt-28">
      <div className="container-main">

        <div className="flex items-center gap-3 mb-10">
          <Heart className="text-pink-500" size={36} />
          <h1 className="text-5xl font-black">
            My Wishlist
          </h1>
        </div>

        {loading ? (
          <h2 className="text-xl font-bold">
            Loading...
          </h2>
        ) : items.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-lg">
            <Heart
              size={60}
              className="mx-auto text-pink-400"
            />

            <h2 className="mt-6 text-3xl font-black">
              Wishlist Empty
            </h2>

            <p className="mt-3 text-slate-500">
              Save your favourite fashion items.
            </p>

            <Link
              to="/explore"
              className="mt-8 inline-flex rounded-full bg-pink-500 px-8 py-3 text-white font-bold"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">

            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl overflow-hidden bg-white shadow-xl"
              >
                <img
                  src={item.image}
                  className="h-72 w-full object-cover"
                />

                <div className="p-6">

                  <h2 className="text-2xl font-black">
                    {item.title}
                  </h2>

                  <p className="text-pink-500 font-bold mt-2">
                    {item.points} Points
                  </p>

                  <div className="flex gap-3 mt-6">

                    <Link
                      to={`/item/${item.id}`}
                      className="flex-1 rounded-full bg-pink-500 text-white py-3 text-center font-bold"
                    >
                      View
                    </Link>

                    <button
                      onClick={() =>
                        handleRemove(item.wishlistId)
                      }
                      className="w-14 rounded-full bg-red-100 text-red-500 flex justify-center items-center"
                    >
                      <Trash2 size={20} />
                    </button>

                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </section>
  );
}