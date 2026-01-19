export function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: strong ? 900 : 600 }}>
      <span style={{ opacity: strong ? 1 : 0.85 }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
