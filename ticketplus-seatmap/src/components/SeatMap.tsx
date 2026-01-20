import type { Seat, SectionId } from "../domain/types";
import { groupByRow, money, sectionMeta } from "../domain/utils";
import { styles } from "../styles/appStyles";

function sectionColor(sec: SectionId) {
  switch (sec) {
    case "VIP":
      return "#14B314"; // verde
    case "PLATEA":
      return "#2B22FF"; // azul/morado
    case "GENERAL":
      return "#F2B600"; // amarillo
  }
}

export function SeatMap({
  seats,
  selectedIds,
  sections,
  maxSeats,
  onToggleSeat,
}: {
  seats: Seat[];
  selectedIds: Set<string>;
  sections: SectionId[];
  maxSeats: number;
  onToggleSeat: (seatId: string) => void;
}) {
  const selectedCount = selectedIds.size;

  return (
    <div>
      <div style={styles.cardHeaderRow}>
        <div style={styles.smallMuted}>
          Seleccionados: <b style={{ color: "#111" }}>{selectedCount}</b> / {maxSeats}
        </div>
      </div>

      {sections.map((sec) => {
        const meta = sectionMeta(sec);
        const seatsSec = seats.filter((s) => s.section === sec);
        const price = seatsSec[0]?.price ?? 0;
        const zone = sectionColor(sec);

        return ( // sección de asientos
          <div key={sec} style={{ marginTop: 14 }}>
            <div style={styles.sectionHeader}>
              <div>
                <div style={styles.sectionName}>{meta.name}</div>
                <div style={styles.sectionHint}>{meta.hint}</div>
              </div>

              <div style={styles.sectionPricePill}>{money(price)} c/u</div>
            </div>

            <div  // leyenda de asientos
              style={{
                display: "flex",
                gap: 14,
                alignItems: "center",
                flexWrap: "wrap",
                marginTop: 8,
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <Legend label="Disponible" color={zone} border={`2px solid ${zone}`} />
              <Legend label="Ocupado / No disponible" color="#E5E7EB" border="1px solid #E5E7EB" />
            </div>

            <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
              {groupByRow(seatsSec).map(([row, rowSeats]) => (
                <div key={row} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={styles.rowBadge}>{row}</div>

                  <div
                    style={{
                      ...styles.seatRowWrap,
                      justifyContent: "center",
                      width: "100%",
                    }}
                  >
                    {rowSeats.map((seat) => {
                      const isSelected = selectedIds.has(seat.id);
                      const disabled = seat.state === "OCCUPIED" || seat.state === "UNAVAILABLE";

                      const background = disabled
                        ? "#E5E7EB" // no disponible/ocupado
                        : isSelected
                        ? "#16A34A" // seleccionado
                        : zone; // color de zona

                      const textColor = disabled ? "#9CA3AF" : "#ffffff";

                      const border = disabled
                        ? "1px solid #E5E7EB"
                        : isSelected
                        ? "2px solid #0B3D1D"
                        : `2px solid ${zone}`;

                      return (
                        <button
                          key={seat.id}
                          onClick={() => onToggleSeat(seat.id)}
                          disabled={disabled}
                          aria-pressed={isSelected}
                          aria-label={`${sec} fila ${seat.row} asiento ${seat.number} ${
                            disabled ? "no disponible" : isSelected ? "seleccionado" : "disponible"
                          }`}
                          title={`${seat.id} — ${money(seat.price)}`}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 999,
                            border,
                            background,
                            color: textColor,
                            fontSize: 12,
                            fontWeight: 900,
                            cursor: disabled ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 0,
                            lineHeight: "32px",
                            boxShadow: disabled ? "none" : "0 6px 14px rgba(0,0,0,0.10)",
                            transform: isSelected ? "scale(1.06)" : "scale(1)",
                            transition: "transform .08s ease",
                            opacity: disabled ? 0.9 : 1,
                          }}
                        >
                          {seat.number}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Legend({
  label,
  color,
  border,
}: {
  label: string;
  color: string;
  border?: string;
}) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span
        style={{
          width: 14,
          height: 14,
          borderRadius: 5,
          background: color,
          border: border ?? "1px solid #dfe3e7",
          display: "inline-block",
        }}
      />
      <span style={{ fontSize: 12, opacity: 0.9 }}>{label}</span>
    </span>
  );
}
