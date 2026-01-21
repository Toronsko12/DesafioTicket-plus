/**
 * VenueOverview
 *
 * Vista inicial del venue (overview) para la selección de zona.
 * Renderiza un “escenario” de referencia y 3 zonas clickeables (VIP/PLATEA/GENERAL)
 * que actúan como primer paso del flujo: al seleccionar una zona se navega al mapa
 * de asientos filtrado por esa sección.
 */

export type SectionId = "VIP" | "PLATEA" | "GENERAL";
export type SeatState = "AVAILABLE" | "SELECTED" | "OCCUPIED" | "UNAVAILABLE";

export type Seat = {
  id: string;
  section: SectionId;
  row: string;
  number: number;
  price: number;
  state: SeatState;
};

type Styles = Record<string, React.CSSProperties>;

export function VenueOverview({
  onSelectSection,
  styles,
}: {
  sections: SectionId[];
  seats: Seat[];
  onSelectSection: (sec: SectionId) => void;
  styles: Styles;
}) {
  return (
    <div style={styles.leftCol}>
      <div style={styles.cardHeaderRow}>
        <h2 style={styles.h2}>Selecciona una ubicación</h2>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
        <div
          style={{
            width: "62%",
            height: 56,
            borderRadius: 14,
            border: "3px solid #111",
            background: "#fff",
            display: "grid",
            placeItems: "center",
            fontWeight: 900,
            letterSpacing: 0.6,
          }}
        >
          ESCENARIO
        </div>
      </div>

      <div style={{ display: "grid", gap: 16, marginTop: 18 }}>
        <ZoneBox
          width="62%"
          title="VIP"
          accent={{ bg: "#00de43", border: "#00de43", pill: "#00de43" }}
          onClick={() => onSelectSection("VIP")}
        />

        <ZoneBox
          width="68%"
          title="PLATEA"
          accent={{ bg: "#2c00f0", border: "#2c00f0", pill: "#2c00f0" }}
          onClick={() => onSelectSection("PLATEA")}
        />

        <ZoneBox
          width="86%"
          title="GENERAL"
          accent={{ bg: "#f3b600", border: "#f3b600", pill: "#f3b600" }}
          onClick={() => onSelectSection("GENERAL")}
        />
      </div>
    </div>
  );
}

function ZoneBox({
  width,
  title,
  accent,
  onClick,
}: {
  width: string;
  title: string;
  accent: { bg: string; border: string; pill: string };
  onClick: () => void;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <button
        onClick={onClick}
        style={{
          width,
          height: 100,
          borderRadius: 16,
          border: `3px solid ${accent.border}`,
          background: accent.bg,
          cursor: "pointer",
          padding: "14px 14px",
          boxShadow: "0 10px 22px rgba(0,0,0,0.07)",
          display: "grid",
          placeItems: "center",
          textAlign: "center",
        }}
      >
        <div style={{ fontWeight: 950, fontSize: 14, letterSpacing: 0.4, color: "#fff" }}>
          {title}
        </div>
      </button>
    </div>
  );
}
