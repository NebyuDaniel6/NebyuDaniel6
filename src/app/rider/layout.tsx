export default function RiderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-canvas">
      <div className="phone-shell mx-auto">{children}</div>
    </div>
  );
}
