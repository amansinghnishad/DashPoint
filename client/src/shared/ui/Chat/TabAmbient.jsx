export default function TabAmbient() {
  return (
    <div className="dp-tab-ambient pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <span className="dp-tab-ambient-glow dp-tab-ambient-glow--one" />
      <span className="dp-tab-ambient-glow dp-tab-ambient-glow--two" />
      <span className="dp-tab-ambient-orbit" />
    </div>
  );
}
