import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ProductCard from "../products/ProductCard";
import SectionHeader from "../common/SectionHeader";
import EmptyState from "../common/EmptyState";
import { getListings } from "../../services/listings";
export default function FeaturedProducts() { const [items, setItems] = useState([]); useEffect(() => { async function load() { const res = await getListings(); if (res.success) setItems(res.data.slice(0, 6)); } load(); }, []); return <section className="container-main py-16"><SectionHeader eyebrow="Featured Swaps" title="Fresh items from the community." action={<Link to="/explore" className="hidden md:flex items-center gap-2 rounded-full bg-pink-500 px-7 py-4 text-white font-black">Explore More <ArrowRight size={18} /></Link>} />{items.length === 0 ? <div className="mt-10"><EmptyState /></div> : <div className="mt-10 grid gap-7 md:grid-cols-2 xl:grid-cols-3">{items.map((item) => <ProductCard key={item.id} item={item} />)}</div>}</section>; }
