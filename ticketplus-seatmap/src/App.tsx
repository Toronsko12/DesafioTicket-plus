import { useEffect, useMemo, useState } from "react";
import type { Seat, SectionId } from "./domain/types";
import { buildSeats, EVENT } from "./domain/seatData";
import { formatMs } from "./domain/utils";
import { styles } from "./styles/appStyles";
import { VenueOverview } from "./components/VenueOverview";
import { HeaderBar } from "./components/HeaderBar";
import { AlertBar } from "./components/AlertBar";
import { SeatMap } from "./components/SeatMap";
import { SummaryCard } from "./components/Summary";
import { BottomBar } from "./components/BottomBar";

const MAX_SEATS = 6;
const HOLD_MS = 10 * 60 * 1000;

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
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);


  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

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
        if (timerStartedAt === null) setTimerStartedAt(Date.now());
      }

      if (next.size === 0) setTimerStartedAt(null);
      return next;
    });
  };

  const reserve = async () => {
    setMessage(null);
    if (selectedSeats.length === 0) return;

    await new Promise((r) => setTimeout(r, 600));

    setSeats((prev) => prev.map((s) => (selectedIds.has(s.id) ? { ...s, state: "OCCUPIED" } : s)));

    setSelectedIds(new Set());
    setTimerStartedAt(null);

    const code = `R-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
    setMessage(`✅ Reserva confirmada. Código: ${code}`);
  };

  const seatsToShow = useMemo(() => {
    if (!activeSection) return seats;
    return seats.filter((s) => s.section === activeSection);
  }, [seats, activeSection]);



  const clear = () => {
    setSelectedIds(new Set());
    setTimerStartedAt(null);
    setMessage(null);
  };

  const sections: SectionId[] = ["VIP", "PLATEA", "GENERAL"];

  return (
    <div style={styles.page}>
      <HeaderBar
        brand="ticketplus · demo"
        title={EVENT.title}
        venue={EVENT.venue}
        dateText={EVENT.dateText}
        address={EVENT.address}
        timerLabel={timerStartedAt !== null ? "Tiempo para reservar" : "Selecciona asientos"}
        timerValue={timerStartedAt !== null ? formatMs(remainingMs) : "00:00"}
      />


      <AlertBar message={message} />

    <div style={styles.content} className="tp_grid">
      {!activeSection ? (
        <VenueOverview
          sections={sections}
          seats={seats}
          onSelectSection={(sec) => setActiveSection(sec)}
          styles={styles}
        />
      ) : (
        <div style={styles.leftCol}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <h2 style={styles.h2}>Asientos — {activeSection}</h2>

            <button
              onClick={() => setActiveSection(null)}
              style={{ ...styles.btn, ...styles.btnSecondary }}
            >
              Volver al mapa
            </button>
          </div>

          <SeatMap
            seats={seats.filter((s) => s.section === activeSection)}
            selectedIds={selectedIds}
            sections={[activeSection]}
            maxSeats={MAX_SEATS}
            onToggleSeat={toggleSeat}
          />
        </div>
      )}

      <SummaryCard
        selectedSeats={selectedSeats}
        maxSeats={MAX_SEATS}
        totals={totals}
        onReserve={reserve}
        onClear={clear}
      />
    </div>

      <BottomBar selectedCount={selectedSeats.length} total={totals.total} onClear={clear} onReserve={reserve} />

      <style>{`
        @media (max-width: 900px){
          .tp_grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
