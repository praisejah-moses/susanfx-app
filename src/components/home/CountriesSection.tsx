// 17 country flag SVG images from source
const flags = [
  "6939697404055d7970a7b4bc_Frame 2147224728.svg",
  "693969adca75a7d45ad1aa73_Frame 2147224729.svg",
  "693969c5c17a034ba1ad6f1c_Frame 2147224730.svg",
  "693969dea224a98eb7e498ff_Frame 2147224731.svg",
  "693969fa3229dd7daa2cb762_Frame 2147224720.svg",
  "69396a0878c312a0e9df50c4_Frame 2147224721.svg",
  "69396a17e5e625b4e2eca0de_Frame 2147224715.svg",
  "69396a26f47e8c17a0f954a3_Frame 2147224716.svg",
  "69396a36fb00ed92434d1b72_Frame 2147224719.svg",
  "69396a49114119eedc95a6a3_Frame 2147224717.svg",
  "69396a59a224a98eb7e4bc9b_Frame 2147224718.svg",
  "69396a68001b98e2c3d788e7_Frame 2147224722.svg",
  "69396a78522b69ecda4c05e0_Frame 2147224723.svg",
  "69396a87c054b8dc4c5f609a_Frame 2147224724.svg",
  "69396a9915ae2d4f072c91f8_Frame 2147224725.svg",
  "69396aa9721c8a117f4d1273_Frame 2147224726.svg",
  "69396ab95292814077296752_Frame 2147224727.svg",
];

export default function CountriesSection() {
  // Duplicate flags array for seamless infinite scroll
  const track = [...flags, ...flags];

  return (
    <section className="py-20 bg-[var(--background-default)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--global-text)] mb-3">
            Available in 182+ Countries
          </h2>
          <p className="text-lg font-semibold text-[var(--text-white-50)]">
            Trade better wherever you are
          </p>
        </div>

        {/* Globe with flags overlay */}
        <div className="relative flex justify-center items-center">
          {/* Globe */}
          <img
            src="/images/index/6937f1b294455e83ff539450_Globe Image.webp"
            alt="Globe"
            loading="lazy"
            className="w-96 h-96 object-contain"
          />

          {/* Flag carousel overlay */}
          <div className="absolute overflow-hidden w-full max-w-3xl">
            <div className="relative h-20">
              {/* Gradient fade masks */}
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[var(--background-default)] to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[var(--background-default)] to-transparent z-10 pointer-events-none" />
              <div className="overflow-hidden h-full">
                <div className="flex gap-8 animate-marquee w-max">
                  {track.map((flag, i) => (
                    <div
                      key={`${flag}-${i}`}
                      className="flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border border-[var(--border-normal)]"
                    >
                      <img
                        src={`/images/index/${flag}`}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee keyframes */}
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </section>
  );
}
