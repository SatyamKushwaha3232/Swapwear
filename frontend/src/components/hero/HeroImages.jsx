// export default function HeroImages() {
//   return (
//     <div className="relative hidden lg:block min-h-[700px] -mt-10 xl:-mt-16">
//       <div className="absolute -top-6 right-0 w-[470px] xl:w-[470px] rounded-[42px] bg-white/50 backdrop-blur-2xl border border-white/60 shadow-[0_35px_100px_rgba(0,0,0,0.14)] p-3 overflow-hidden">
//         <div className="relative overflow-hidden rounded-[34px]">
//           <video
//             autoPlay
//             muted
//             loop
//             playsInline
//             preload="auto"
//             className="w-full h-[540px] object-cover"
//           >
//             <source
//               src="https://videos.pexels.com/video-files/853889/853889-hd_1920_1080_25fps.mp4"
//               type="video/mp4"
//             />
//           </video>

//           <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent"></div>

//           <div className="absolute bottom-6 left-6 flex items-center gap-3 px-5 py-3 rounded-full bg-white/80 backdrop-blur-xl shadow-xl">
//             <div className="w-10 h-10 rounded-full bg-[var(--accent)]"></div>
//             <div>
//               <p className="text-sm text-[var(--muted)] font-semibold">
//                 Featured
//               </p>
//               <h4 className="font-black">SwapWear Showcase</h4>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="absolute left-0 top-[130px] w-[315px] rounded-[34px] bg-white/55 backdrop-blur-2xl border border-white/60 shadow-[0_30px_90px_rgba(0,0,0,0.14)] p-3 overflow-hidden rotate-[-5deg] hover:rotate-0 transition duration-500">
//         <img
//           src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=900&auto=format&fit=crop"
//           alt="Luxury Streetwear"
//           className="w-full h-[340px] object-cover rounded-[26px]"
//         />

//         <div className="pt-4 pb-2 px-2">
//           <h3 className="text-xl font-black">Luxury Streetwear</h3>
//           <p className="text-[var(--muted)] mt-1">
//             Premium curated collection
//           </p>
//         </div>
//       </div>

//       <div className="absolute left-[120px] bottom-[110px]  w-[365px] rounded-[36px] bg-white/65 backdrop-blur-2xl border border-white/60 shadow-[0_35px_100px_rgba(0,0,0,0.16)] p-4 overflow-hidden rotate-[5deg] hover:rotate-0 transition duration-500">
//         <img
//           src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=900&auto=format&fit=crop"
//           alt="Sustainable Fashion"
//           className="w-full h-[250px] object-cover rounded-[28px]"
//         />

//         <div className="pt-5 px-2 flex items-center justify-between">
//           <div>
//             <h3 className="text-xl font-black">Sustainable Fashion</h3>
//             <p className="text-[var(--muted)] mt-1">Reuse • Refresh • Repeat</p>
//           </div>

//           <button className="w-14 h-14 rounded-full bg-pink-400/40 backdrop-blur-xl border border-white/50 font-black shadow-xl">
//             →
//           </button>
//         </div>
//       </div>

//       <div className="absolute right-[40px] top-[435px] px-6 py-5 rounded-[28px] bg-white/75 backdrop-blur-2xl border border-white/60 shadow-[0_25px_70px_rgba(0,0,0,0.14)]">
//         <p className="text-sm text-[var(--muted)] font-semibold">
//           Community Impact
//         </p>
//         <h3 className="text-3xl font-black mt-1">24 Tons</h3>
//         <p className="text-sm text-[var(--muted)] mt-1">textile waste saved</p>
//       </div>
//     </div>
//   );
// }
export default function HeroImages() {
  return (
    <div className="relative hidden lg:block min-h-[700px] -mt-10 xl:-mt-16">
      {/* BACK VIDEO CARD */}
      <div className="absolute top-[10px] right-0 w-[470px] rounded-[42px] bg-white/45 backdrop-blur-2xl border border-white/60 shadow-[0_35px_100px_rgba(0,0,0,0.16)] p-3 overflow-hidden">
        <div className="relative overflow-hidden rounded-[34px]">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="w-full h-[540px] object-cover"
          >
            <source
              src="https://videos.pexels.com/video-files/853889/853889-hd_1920_1080_25fps.mp4"
              type="video/mp4"
            />
          </video>

          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
        </div>
      </div>

      {/* MIDDLE CARD - more visible */}
      <div className="absolute left-[0px] top-[155px] w-[300px] rounded-[34px] bg-white/55 backdrop-blur-2xl border border-white/60 shadow-[0_30px_90px_rgba(0,0,0,0.14)] p-3 overflow-hidden rotate-[-5deg] hover:rotate-0 transition duration-500 z-10">
        <img
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=900&auto=format&fit=crop"
          alt="Luxury Streetwear"
          className="w-full h-[360px] object-cover rounded-[26px]"
        />

        <div className="pt-4 pb-2 px-2">
          <h3 className="text-xl font-black">Luxury Streetwear</h3>
          <p className="text-[var(--muted)] mt-1">
            Premium curated collection
          </p>
        </div>
      </div>

      {/* FRONT CARD - smaller and shifted right */}
      <div className="absolute left-[235px] top-[250px] w-[335px] rounded-[34px] bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_35px_100px_rgba(0,0,0,0.16)] p-4 overflow-hidden rotate-[4deg] hover:rotate-0 transition duration-500 z-20">
        <img
          src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=900&auto=format&fit=crop"
          alt="Sustainable Fashion"
          className="w-full h-[235px] object-cover rounded-[26px]"
        />

        <div className="pt-5 px-2 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black">Sustainable Fashion</h3>
            <p className="text-[var(--muted)] mt-1 text-sm">
              Reuse • Refresh • Repeat
            </p>
          </div>

          <button className="w-12 h-12 rounded-full bg-pink-400/40 backdrop-blur-xl border border-white/50 font-black shadow-xl">
            →
          </button>
        </div>
      </div>

      {/* IMPACT CARD */}
      <div className="absolute right-[35px] top-[520px] px-6 py-5 rounded-[28px] bg-white/75 backdrop-blur-2xl border border-white/60 shadow-[0_25px_70px_rgba(0,0,0,0.14)] z-30">
        <p className="text-sm text-[var(--muted)] font-semibold">
          Community Impact
        </p>
        <h3 className="text-3xl font-black mt-1">24 Tons</h3>
        <p className="text-sm text-[var(--muted)] mt-1">textile waste saved</p>
      </div>
    </div>
  );
}
