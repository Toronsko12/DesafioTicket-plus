/**
 * SummaryCard
 *
 * Tarjeta de resumen de compra. Muestra en tiempo real los asientos seleccionados,
 * el desglose de costos (subtotal + cargo por servicio) y las acciones principales
 * (reservar / limpiar). Refleja el estado actual de selección y deshabilita la
 * acción de reserva cuando no hay asientos seleccionados.
 */
import type { Seat } from "../domain/types";
import { money, seatLabel } from "../domain/utils";
import { Row } from "./ui/Row";
import { styles } from "../styles/appStyles";

export function SummaryCard({
  selectedSeats,
  maxSeats,
  totals,
  onReserve,
  onClear,
}: {
  selectedSeats: Seat[];
  maxSeats: number;
  totals: { subtotal: number; fee: number; total: number };
  onReserve: () => void;
  onClear: () => void;
}) {
  return (
    <div style={styles.rightCol}>
      <div style={styles.infoCard}>
        <h3 style={styles.h3}>Resumen</h3>

        <div style={styles.smallMuted}>
          {selectedSeats.length === 0
            ? "Selecciona tus asientos en el mapa."
            : `Seleccionados: ${selectedSeats.length} / ${maxSeats}`}
        </div>

        <ul style={styles.list}>
          {selectedSeats.length === 0 ? (
            <li style={{ color: "#6b7280" }}>No hay asientos seleccionados</li>
          ) : (
            selectedSeats
              .slice()
              .sort((a, b) =>
                a.section !== b.section
                  ? a.section.localeCompare(b.section)
                  : a.row !== b.row
                  ? a.row.localeCompare(b.row)
                  : a.number - b.number
              )
              .map((s) => (
                <li key={s.id} style={styles.listItem}>
                  <span style={{ fontWeight: 800 }}>{seatLabel(s)}</span>
                  <span style={{ fontWeight: 800 }}>{money(s.price)}</span>
                </li>
              ))
          )}
        </ul>

        <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
          <Row label="Subtotal" value={money(totals.subtotal)} />
          <Row label="Cargo servicio (10%)" value={money(totals.fee)} />
          <Row label="Total" value={money(totals.total)} strong />
        </div>

        <button
          onClick={onReserve}
          disabled={selectedSeats.length === 0}
          style={{
            ...styles.btn,
            ...styles.btnPrimary,
            opacity: selectedSeats.length === 0 ? 0.5 : 1,
            cursor: selectedSeats.length === 0 ? "not-allowed" : "pointer",
            marginTop: 12,
            width: "100%",
          }}
        >
          Reservar
        </button>

        <button
          onClick={onClear}
          style={{
            ...styles.btn,
            ...styles.btnSecondary,
            marginTop: 8,
            width: "100%",
          }}
        >
          Limpiar selección
        </button>

        <p style={styles.smallNote}>
          * La selección se libera automáticamente a los 10 minutos desde el primer asiento.
        </p>
      </div>
    </div>
  );
}
