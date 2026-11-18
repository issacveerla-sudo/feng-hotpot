// Decorative CSS/emoji hotpot bowl used in the hero.
// Swap this for a real photo by dropping an <img src="/hero.jpg" /> here.
export default function HeroBowl() {
  const floats = [
    { e: "🌶️", cls: "left-[6%] top-[12%]", d: "0s" },
    { e: "🥩", cls: "right-[8%] top-[8%]", d: "0.8s" },
    { e: "🍄", cls: "left-[0%] top-[55%]", d: "1.4s" },
    { e: "🥬", cls: "right-[2%] top-[58%]", d: "0.4s" },
    { e: "🦐", cls: "left-[18%] bottom-[2%]", d: "1.1s" },
    { e: "🌽", cls: "right-[20%] bottom-[0%]", d: "0.2s" },
  ];
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      {/* glow */}
      <div className="absolute inset-0 animate-flicker rounded-full bg-flame/30 blur-3xl" />
      {/* pot */}
      <div className="absolute inset-[8%] rounded-full border-[10px] border-black/80 shadow-glow"
        style={{
          background:
            "radial-gradient(circle at 50% 35%, #E23B2E 0%, #B5121B 45%, #5c0a0d 80%, #2a0607 100%)",
        }}
      >
        <div className="absolute inset-6 rounded-full border border-white/10" />
        {/* chili flecks */}
        <div className="absolute inset-0 rounded-full"
          style={{
            backgroundImage:
              "radial-gradient(3px 3px at 30% 40%, rgba(242,121,43,.9), transparent), radial-gradient(2px 2px at 60% 30%, rgba(232,176,75,.9), transparent), radial-gradient(3px 3px at 70% 60%, rgba(242,121,43,.8), transparent), radial-gradient(2px 2px at 40% 70%, rgba(232,176,75,.8), transparent)",
          }}
        />
        <div className="flex h-full items-center justify-center text-7xl drop-shadow-lg">🍲</div>
      </div>
      {/* floating ingredients */}
      {floats.map((f, i) => (
        <span
          key={i}
          className={`absolute animate-floaty text-3xl ${f.cls}`}
          style={{ animationDelay: f.d }}
        >
          {f.e}
        </span>
      ))}
    </div>
  );
}
