export default function PrintFrame() {
  const corners = [
    "top-4 left-4 border-t border-l",
    "top-4 right-4 border-t border-r",
    "bottom-4 left-4 border-b border-l",
    "bottom-4 right-4 border-b border-r",
  ];
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-40">
      {corners.map((c) => (
        <span key={c} className={`absolute w-5 h-5 border-ink/30 ${c}`} />
      ))}
    </div>
  );
}
