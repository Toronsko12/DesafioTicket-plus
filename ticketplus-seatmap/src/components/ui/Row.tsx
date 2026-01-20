/**
 * Fila reutilizable para mostrar un par "label / value" alineado a los extremos.
 * Se usa en el resumen de compra (Subtotal, Cargo, Total).
 *
 * - `label`: texto descriptivo a la izquierda.
 * - `value`: valor a la derecha (ej. "$12.000 CLP").
 * - `strong`: si es true, resalta la fila (pensado para el Total).
 */
export function Row({
  label,
  value,
  strong,
}: {
  /** Texto descriptivo (lado izquierdo) */
  label: string;

  /** Valor asociado (lado derecho) */
  value: string;

  /** Si es true, aplica mayor énfasis visual (ej. Total) */
  strong?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        // Resalta el peso tipográfico cuando es una fila “importante”
        fontWeight: strong ? 900 : 600,
      }}
    >
      {/* Label con leve baja opacidad para jerarquía visual */}
      <span style={{ opacity: strong ? 1 : 0.85 }}>{label}</span>

      {/* Valor siempre visible al 100% */}
      <span>{value}</span>
    </div>
  );
}
