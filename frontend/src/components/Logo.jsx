export default function Logo({ compact = false }) {
  return (
    <div className="brand">
      <div className="brand-mark">🥛</div>
      {!compact && <div><strong>Digital Milk</strong><span>Management System</span></div>}
    </div>
  );
}