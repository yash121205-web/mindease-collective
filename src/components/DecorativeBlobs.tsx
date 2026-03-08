export default function DecorativeBlobs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
      {/* Top-left primary blob */}
      <div
        className="absolute -top-32 -left-32 w-80 h-80 rounded-full opacity-[0.07]"
        style={{ background: 'radial-gradient(circle, hsl(207 90% 72%), transparent 70%)' }}
      />
      {/* Top-right lavender blob */}
      <div
        className="absolute -top-20 -right-24 w-72 h-72 rounded-full opacity-[0.06]"
        style={{ background: 'radial-gradient(circle, hsl(263 60% 76%), transparent 70%)' }}
      />
      {/* Bottom-left peach blob */}
      <div
        className="absolute -bottom-24 -left-20 w-64 h-64 rounded-full opacity-[0.06]"
        style={{ background: 'radial-gradient(circle, hsl(20 90% 87%), transparent 70%)' }}
      />
      {/* Bottom-right secondary blob */}
      <div
        className="absolute -bottom-16 -right-28 w-72 h-72 rounded-full opacity-[0.05]"
        style={{ background: 'radial-gradient(circle, hsl(263 55% 82%), transparent 70%)' }}
      />
    </div>
  );
}
