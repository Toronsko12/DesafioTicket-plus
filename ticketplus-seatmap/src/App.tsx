import { useEffect, useMemo, useRef, useState } from "react";
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
import { Evento } from "./components/Evento";


const MAX_SEATS = 6; // máximo de asientos seleccionables por usuario
const HOLD_MS = 10 * 60 * 1000;


export default function App() {
  const [seats, setSeats] = useState<Seat[]>(() => {
    const raw = localStorage.getItem("tp_seats"); // cargar asientos desde localStorage
    return raw ? (JSON.parse(raw) as Seat[]) : buildSeats();
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    const raw = localStorage.getItem("tp_selected");
    return raw ? new Set<string>(JSON.parse(raw) as string[]) : new Set<string>();  // conjunto de IDs de asientos seleccionados
  });

  const [timerStartedAt, setTimerStartedAt] = useState<number | null>(() => {
    const raw = localStorage.getItem("tp_timer_started"); // cargar tiempo de inicio del temporizador desde localStorage
    return raw ? Number(raw) : null;
  });

  const [now, setNow] = useState<number>(() => Date.now());
  const [message, setMessage] = useState<string | null>(null); // mensaje de alerta para el usuario
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    localStorage.setItem("tp_seats", JSON.stringify(seats));
  }, [seats]);

  useEffect(() => {
    localStorage.setItem("tp_selected", JSON.stringify(Array.from(selectedIds))); // guardar selección de asientos en localStorage
  }, [selectedIds]);

  useEffect(() => {
    if (timerStartedAt === null) localStorage.removeItem("tp_timer_started");
    else localStorage.setItem("tp_timer_started", String(timerStartedAt));
  }, [timerStartedAt]);

  const selectedSeats = useMemo(() => {
    const map = new Map(seats.map((s) => [s.id, s]));
    return Array.from(selectedIds).map((id) => map.get(id)).filter(Boolean) as Seat[]; // asientos actualmente seleccionados
  }, [selectedIds, seats]);

  const totals = useMemo(() => {
    const subtotal = selectedSeats.reduce((a, s) => a + s.price, 0); // suma de precios de los asientos seleccionados
    const fee = Math.round(subtotal * 0.1);
    return { subtotal, fee, total: subtotal + fee };
  }, [selectedSeats]);

  const remainingMs = useMemo(() => {
    if (timerStartedAt === null) return 0;
    return Math.max(0, HOLD_MS - (now - timerStartedAt));
  }, [now, timerStartedAt]);

  useEffect(() => { // liberar asientos si el temporizador llega a cero
    if (timerStartedAt !== null && remainingMs === 0 && selectedIds.size > 0) {
      setSelectedIds(new Set());
      setTimerStartedAt(null);  
      setMessage("Se acabó el tiempo. Tu selección fue liberada.");
    }
  }, [remainingMs, timerStartedAt, selectedIds.size]);

  const toggleSeat = (seatId: string) => { // función para seleccionar o deseleccionar un asiento
    setMessage(null);

    const seat = seats.find((s) => s.id === seatId);
    if (!seat) return;
    if (seat.state === "OCCUPIED" || seat.state === "UNAVAILABLE") return;

    setSelectedIds((prev) => { // actualizar el conjunto de asientos seleccionados
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

  const reserve = async () => { // función para reservar los asientos seleccionados
    setMessage(null);
    if (selectedSeats.length === 0) return;

    await new Promise((r) => setTimeout(r, 600));

    setSeats((prev) =>
      prev.map((s) => (selectedIds.has(s.id) ? { ...s, state: "OCCUPIED" } : s))
    );

    setSelectedIds(new Set());
    setTimerStartedAt(null);

    const code = `R-${Math.random().toString(16).slice(2, 8).toUpperCase()}`; // generar código de reserva aleatorio
    setMessage(`✅ Reserva confirmada. Código: ${code}`);
  };

  const clear = () => { // función para limpiar la selección de asientos
    setSelectedIds(new Set());
    setTimerStartedAt(null);
    setMessage(null);
  };

const [bottomVisible, setBottomVisible] = useState(true);

useEffect(() => {
  const TOP_SHOW_PX = 8; // ajusta: 0 = solo exacto arriba, 8/12 = un poquito de margen

  const onScroll = () => {
    const y = window.scrollY;
    setBottomVisible(y <= TOP_SHOW_PX);
  };

  onScroll(); // set inicial
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
}, []);



  const sections: SectionId[] = ["VIP", "PLATEA", "GENERAL"];

  return (
    <div style={styles.page}>
        <HeaderBar
          brand="ticketplus"
          title={EVENT.title}
          venue={EVENT.venue}
          dateText={EVENT.dateText}
          address={EVENT.address}
          timerLabel="Tiempo para reservar"
          timerValue={timerStartedAt !== null ? formatMs(remainingMs) : ""}
          showTimer={timerStartedAt !== null}
        />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>
        <Evento
          imageUrl="/Avenged.jpg"
          title="Avenged Sevenfold Live in Chile 2026"
          subtitle="24 de enero · Estadio Bicentenario de La Florida, Santiago"
        />

        <AlertBar message={message} />

          <div
            className="tp_grid2"
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "1fr 1.4fr",
            gap: 16,
            alignItems: "start",
          }}
        >
          <div style={styles.leftCol}>
            <h3 style={styles.h3}>Estadio Bicentenario de La Florida</h3>

            <div style={{ marginTop: 10 }}>
              <iframe
                title="mapa"
                width="100%"
                height="260"
                style={{ border: 0, borderRadius: 14 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps?q=Estadio%20Bicentenario&output=embed"
              />
            </div>

            <div style={{ marginTop: 10, fontSize: 14 }}>
              <b>{EVENT.venue}</b>
              <div style={{ opacity: 0.8 }}>{EVENT.address}</div>
            </div>
          </div>

      <div style={styles.leftCol}>
        {!activeSection ? (
          <VenueOverview
            sections={sections}
            seats={seats}
            onSelectSection={(sec) => setActiveSection(sec)}
            styles={styles}
          />
        ) : (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                marginBottom: 12,
              }}
            >
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
          </>
        )}


            <SummaryCard
              selectedSeats={selectedSeats}
              maxSeats={MAX_SEATS}
              totals={totals}
              onReserve={reserve}
              onClear={clear}
            />
          </div>
        </div>
      </div>


    <BottomBar
      selectedCount={selectedSeats.length}
      total={totals.total}
      onClear={clear}
      onReserve={reserve}
      visible={bottomVisible}
    />

    
      <style>{`
        @media (max-width: 900px){
          .tp_grid2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
