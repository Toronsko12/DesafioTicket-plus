import { useEffect, useMemo, useState } from "react";

type SectionId = "VIP" | "PLATEA" | "GENERAL";
type SeatState = "AVAILABLE" | "SELECTED" | "OCCUPIED" | "UNAVAILABLE";

type Seat = {
  id: string;
  section: SectionId;
  row: string;
  number: number;
  price: number;
  state: SeatState;
};

const MAX_SEATS = 6;
const HOLD_MS = 10 * 60 * 1000;

function buildSeats(): Seat[] {
  const sections: { id: SectionId; rows: string[]; cols: number; price: number }[] = [
    { id: "VIP", rows: ["A", "B"], cols: 8, price: 30000 },
    { id: "PLATEA", rows: ["C", "D", "E"], cols: 10, price: 22000 },
    { id: "GENERAL", rows: ["F", "G", "H"], cols: 12, price: 15000 },
  ];

  const seats: Seat[] = [];
  sections.forEach((sec) => {
    sec.rows.forEach((row) => {
      for (let n = 1; n <= sec.cols; n++) {
        const id = `${sec.id}-${row}-${String(n).padStart(2, "0")}`;
        const rnd = Math.random();
        const state: SeatState =
          rnd < 0.08 ? "OCCUPIED" : rnd < 0.12 ? "UNAVAILABLE" : "AVAILABLE";

        seats.push({
          id,
          section: sec.id,
          row,
          number: n,
          price: sec.price,
          state,
        });
      }
    });
  });

  return seats;
}

function money(n: number) {
  return `$${n.toLocaleString("es-CL")}`;
}

export default function App() {
  const [seats, setSeats] = useState<Seat[]>(() => {
    const raw = localStorage.getItem("tp_seats");
    return raw ? (JSON.parse(raw) as Seat[]) : buildSeats();
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    const raw = localStorage.getItem("tp_selected");
    return raw ? new Set<string>(JSON.parse(raw) as string[]) : new Set<string>();
  });

  const [timerStartedAt, setTimerStartedAt] = useState<number | null>(() => {
    const raw = localStorage.getItem("tp_timer_started");
    return raw ? Number(raw) : null;
  });

  const [now, setNow] = useState<number>(() => Date.now());
  const [message, setMessage] = useState<string | null>(null);

  // Tick del timer
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Persistencia
  useEffect(() => {
    localStorage.setItem("tp_seats", JSON.stringify(seats));
  }, [seats]);

  useEffect(() => {
    localStorage.setItem("tp_selected", JSON.stringify(Array.from(selectedIds)));
  }, [selectedIds]);

  useEffect(() => {
    if (timerStartedAt === null) localStorage.removeItem("tp_timer_started");
    else localStorage.setItem("tp_timer_started", String(timerStartedAt));
  }, [timerStartedAt]);

  const selectedSeats = useMemo(() => {
    const map = new Map(seats.map((s) => [s.id, s]));
    return Array.from(selectedIds).map((id) => map.get(id)).filter(Boolean) as Seat[];
  }, [selectedIds, seats]);

  const totals = useMemo(() => {
    const subtotal = selectedSeats.reduce((a, s) => a + s.price, 0);
    const fee = Math.round(subtotal * 0.1);
    return { subtotal, fee, total: subtotal + fee };
  }, [selectedSeats]);

  const remainingMs = useMemo(() => {
    if (timerStartedAt === null) return 0;
    return Math.max(0, HOLD_MS - (now - timerStartedAt));
  }, [now, timerStartedAt]);

  // Si expiró, limpiar
  useEffect(() => {
    if (timerStartedAt !== null && remainingMs === 0 && selectedIds.size > 0) {
      setSelectedIds(new Set());
      setTimerStartedAt(null);
      setMessage("⏰ Se acabó el tiempo. Tu selección fue liberada.");
    }
  }, [remainingMs, timerStartedAt, selectedIds.size]);

  const toggleSeat = (seatId: string) => {
    setMessage(null);

    const seat = seats.find((s) => s.id === seatId);
    if (!seat) return;

    if (seat.state === "OCCUPIED" || seat.state === "UNAVAILABLE") return;

    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (next.has(seatId)) {
        next.delete(seatId);
      } else {
        if (next.size >= MAX_SEATS) {
          setMessage(`Máximo ${MAX_SEATS} asientos por compra.`);
          return prev;
        }
        next.add(seatId);
        // Arranca timer al primer asiento
        if (timerStartedAt === null) setTimerStartedAt(Date.now());
      }

      // Si quedó vacío, reset timer
      if (next.size === 0) setTimerStartedAt(null);

      return next;
    });
  };

  const reserve = async () => {
    setMessage(null);
    if (selectedSeats.length === 0) return;

    // Simulación reserva
    await new Promise((r) => setTimeout(r, 600));

    // Marcar como ocupados
    setSeats((prev) =>
      prev.map((s) => (selectedIds.has(s.id) ? { ...s, state: "OCCUPIED" } : s))
    );

    setSelectedIds(new Set());
    setTimerStartedAt(null);

    const code = `R-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
    setMessage(`✅ Reserva confirmada. Código: ${code}`);
  };

  const sections: SectionId[] = ["VIP", "PLATEA", "GENERAL"];

  return (
    <div style={{ padding: 16, fontFamily: "system-ui, Arial" }}>
      <h2 style={{ marginTop: 0 }}>Ticketplus — Selección de Asientos</h2>

      {message && (
        <div style={{ padding: 10, border: "1px solid #ddd", borderRadius: 10, marginBottom: 12 }}>
          {message}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 16,
          alignItems: "start",
        }}
      >
        {/* MAPA */}
        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <h3 style={{ margin: 0 }}>Mapa</h3>

            {timerStartedAt !== null && (
              <div style={{ fontSize: 13 }}>
                ⏳ Tiempo: <b>{formatMs(remainingMs)}</b>
              </div>
            )}
          </div>

          {sections.map((sec) => (
            <div key={sec} style={{ marginTop: 14 }}>
              <h4 style={{ margin: "8px 0" }}>{sec}</h4>
              <div style={{ display: "grid", gap: 8 }}>
                {groupByRow(seats.filter((s) => s.section === sec)).map(([row, rowSeats]) => (
                  <div key={row} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 28, fontWeight: 600 }}>{row}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {rowSeats.map((seat) => {
                        const isSelected = selectedIds.has(seat.id);
                        const disabled = seat.state === "OCCUPIED" || seat.state === "UNAVAILABLE";
                        const bg =
                          seat.state === "OCCUPIED"
                            ? "#999"
                            : seat.state === "UNAVAILABLE"
                            ? "#ddd"
                            : isSelected
                            ? "#22c55e"
                            : "#60a5fa";

                        return (
                          <button
                            key={seat.id}
                            onClick={() => toggleSeat(seat.id)}
                            disabled={disabled}
                            aria-pressed={isSelected}
                            aria-label={`${sec} fila ${seat.row} asiento ${seat.number} ${
                              disabled ? "no disponible" : isSelected ? "seleccionado" : "disponible"
                            }`}
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 8,
                              border: "1px solid #ccc",
                              background: bg,
                              cursor: disabled ? "not-allowed" : "pointer",
                              color: "#111",
                              fontSize: 12,
                            }}
                            title={`${seat.id} — ${money(seat.price)}`}
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
          ))}

          <div style={{ marginTop: 12, fontSize: 12, color: "#444", display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Legend label="Disponible" color="#60a5fa" />
            <Legend label="Seleccionado" color="#22c55e" />
            <Legend label="Ocupado" color="#999" />
            <Legend label="No disponible" color="#ddd" />
          </div>
        </div>

        {/* RESUMEN */}
        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>Resumen</h3>

          <div style={{ fontSize: 13, color: "#555" }}>
            Seleccionados: <b>{selectedSeats.length}</b> / {MAX_SEATS}
          </div>

          <ul style={{ paddingLeft: 18 }}>
            {selectedSeats.length === 0 ? (
              <li style={{ color: "#777" }}>No hay asientos seleccionados</li>
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
                  <li key={s.id}>
                    {s.id} — {money(s.price)}
                  </li>
                ))
            )}
          </ul>

          <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
            <Row label="Subtotal" value={money(totals.subtotal)} />
            <Row label="Cargo servicio (10%)" value={money(totals.fee)} />
            <Row label="Total" value={money(totals.total)} strong />
          </div>

          <button
            onClick={reserve}
            disabled={selectedSeats.length === 0}
            style={{
              marginTop: 12,
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #111",
              background: selectedSeats.length === 0 ? "#eee" : "#111",
              color: selectedSeats.length === 0 ? "#999" : "#fff",
              cursor: selectedSeats.length === 0 ? "not-allowed" : "pointer",
            }}
          >
            Reservar
          </button>

          <button
            onClick={() => {
              setSelectedIds(new Set());
              setTimerStartedAt(null);
              setMessage(null);
            }}
            style={{
              marginTop: 8,
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #ccc",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Limpiar selección
          </button>

          <p style={{ marginTop: 12, fontSize: 12, color: "#666" }}>
            * La selección se libera automáticamente a los 10 minutos desde el primer asiento.
          </p>
        </div>
      </div>

      {/* Responsive simple */}
      <style>{`
        @media (max-width: 900px){
          div[style*="grid-template-columns: 1fr 320px"]{
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

function groupByRow(seats: Seat[]) {
  const map = new Map<string, Seat[]>();
  for (const s of seats) {
    const arr = map.get(s.row) ?? [];
    arr.push(s);
    map.set(s.row, arr);
  }
  return Array.from(map.entries()).map(([row, arr]) => [
    row,
    arr.slice().sort((a, b) => a.number - b.number),
  ]) as Array<[string, Seat[]]>;
}

function formatMs(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function Legend({ label, color }: { label: string; color: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 12, height: 12, borderRadius: 999, background: color, border: "1px solid #ccc" }} />
      {label}
    </span>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: strong ? 700 : 400 }}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
