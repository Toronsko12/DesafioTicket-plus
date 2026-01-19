// src/components/VenueOverview.tsx
import { useMemo } from "react";

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
  sections,
  seats,
  onSelectSection,
  styles,
}: {
  sections: SectionId[];
  seats: Seat[];
  onSelectSection: (sec: SectionId) => void;
  styles: Styles;
}) {
  const stats = useMemo(() => {
    const bySec = new Map<
      SectionId,
      { available: number; occupied: number; unavailable: number; total: number; price: number }
    >();

    sections.forEach((sec) =>
      bySec.set(sec, { available: 0, occupied: 0, unavailable: 0, total: 0, price: 0 })
    );

    for (const s of seats) {
      const v = bySec.get(s.section);
      if (!v) continue;
      v.total += 1;
      v.price = s.price;
      if (s.state === "OCCUPIED") v.occupied += 1;
      else if (s.state === "UNAVAILABLE") v.unavailable += 1;
      else v.available += 1;
    }

    return bySec;
  }, [seats, sections]);



  return (
    <div style={styles.leftCol}>
      <div style={styles.cardHeaderRow}>
        <h2 style={styles.h2}>Selecciona una ubicación</h2>
      </div>

      {/* ESCENARIO */}
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

      {/* ZONAS (2 chicas + 1 mediana) */}
    <div style={{ display: "grid", gap: 16, marginTop: 18 }}>
    <ZoneBox
        width="62%"
        title="VIP"
        accent={{ bg: "#00de43", border: "#00de43", pill: "#00de43" }}  // verde
        onClick={() => onSelectSection("VIP")}
    />

    <ZoneBox
        width="68%"
        title="PLATEA"
        accent={{ bg: "#2c00f0", border: "#2c00f0", pill: "#2c00f0" }}  // morado medio gris
        onClick={() => onSelectSection("PLATEA")}
    />

    <ZoneBox
        width="86%"
        title="GENERAL"
        accent={{ bg: "#f3b600", border: "#f3b600", pill: "#f3b600" }}  // amarillo
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
