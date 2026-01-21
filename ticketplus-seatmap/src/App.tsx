import { useEffect, useMemo, useState } from "react";
import type { Seat, SectionId } from "./domain/types";
import { buildSeats, EVENT } from "./domain/seatData";
import { formatMs } from "./domain/utils";
import { styles } from "./styles/appStyles";
import Avenged from "./assets/Avenged.jpg";

import { VenueOverview } from "./components/VenueOverview";
import { HeaderBar } from "./components/HeaderBar";
import { AlertBar } from "./components/AlertBar";
import { SeatMap } from "./components/SeatMap";
import { SummaryCard } from "./components/Summary";
import { BottomBar } from "./components/BottomBar";
import { Evento } from "./components/Evento";

/**
 * Configuración general
 * - MAX_SEATS: máximo de asientos seleccionables por compra
 * - HOLD_MS: tiempo máximo de retención de la selección (10 min)
 */
const MAX_SEATS = 6;
const HOLD_MS = 10 * 60 * 1000;

export default function App() {
  /**
   * Estado principal de asientos:
   * - Se inicializa desde localStorage si existe, si no se generan asientos demo.
   */
  const [seats, setSeats] = useState<Seat[]>(() => {
    const raw = localStorage.getItem("tp_seats");
    return raw ? (JSON.parse(raw) as Seat[]) : buildSeats();
  });

  /**
   * Estado de selección:
   * - selectedIds guarda IDs (Set) para togglear rápido y sin duplicados.
   */
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    const raw = localStorage.getItem("tp_selected");
    return raw ? new Set<string>(JSON.parse(raw) as string[]) : new Set<string>();
  });

  /**
   * Timer:
   * - timerStartedAt solo se setea cuando el usuario selecciona el primer asiento.
   * - Se persiste para sobrevivir refresh.
   */
  const [timerStartedAt, setTimerStartedAt] = useState<number | null>(() => {
    const raw = localStorage.getItem("tp_timer_started");
    return raw ? Number(raw) : null;
  });

  /**
   * UI state:
   * - now: “tick” del timer (1s)
   * - message: mensajes de alerta (confirmaciones / errores)
   * - activeSection: controla si estamos viendo el overview o el mapa de una zona
   */
  const [now, setNow] = useState<number>(() => Date.now());
  const [message, setMessage] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);

  /**
   * Tick del reloj (solo para renderizar remainingMs en pantalla).
   */
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  /**
   * Persistencia de estado en localStorage:
   * - asientos (incluye ocupados)
   * - selección
   * - inicio de temporizador (o se elimina si no hay)
   */
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

  /**
   * Derivados:
   * - selectedSeats: transforma selectedIds en objetos Seat
   * - totals: subtotal + fee + total
   * - remainingMs: tiempo restante para reservar
   */
  const selectedSeats = useMemo(() => {
    const map = new Map(seats.map((s) => [s.id, s]));
    return Array.from(selectedIds)
      .map((id) => map.get(id))
      .filter(Boolean) as Seat[];
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

  /**
   * Expiración del timer:
   * - si se acabó el tiempo y hay selección, se libera automáticamente
   */
  useEffect(() => {
    if (timerStartedAt !== null && remainingMs === 0 && selectedIds.size > 0) {
      setSelectedIds(new Set());
      setTimerStartedAt(null);
      setMessage("Se acabó el tiempo. Tu selección fue liberada.");
    }
  }, [remainingMs, timerStartedAt, selectedIds.size]);

  /**
   * Toggle de asiento:
   * - no permite seleccionar OCCUPIED/UNAVAILABLE
   * - limita a MAX_SEATS
   * - inicia timer al primer asiento
   * - si la selección queda vacía, reinicia timer
   */
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

  /**
   * Reservar (simulación):
   * - espera 600ms
   * - marca seleccionados como OCCUPIED
   * - limpia selección y timer
   * - muestra código de reserva
   */
  const reserve = async () => {
    setMessage(null);
    if (selectedSeats.length === 0) return;

    await new Promise((r) => setTimeout(r, 600));

    setSeats((prev) =>
      prev.map((s) => (selectedIds.has(s.id) ? { ...s, state: "OCCUPIED" } : s))
    );

    setSelectedIds(new Set());
    setTimerStartedAt(null);

    const code = `R-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
    setMessage(`✅ Reserva confirmada. Código: ${code}`);
  };

  /**
   * Limpiar selección manualmente
   */
  const clear = () => {
    setSelectedIds(new Set());
    setTimerStartedAt(null);
    setMessage(null);
  };

  /**
   * Visibilidad de BottomBar:
   * - visible solo si el usuario está arriba (scrollY bajo)
   */
  const [bottomVisible, setBottomVisible] = useState(true);

  useEffect(() => {
    const TOP_SHOW_PX = 8;

    const onScroll = () => {
      setBottomVisible(window.scrollY <= TOP_SHOW_PX);
    };

    onScroll();
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
          imageUrl={Avenged}
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
          {/* Card izquierda: mapa real + datos */}
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

          {/* Card derecha: overview/seatmap + summary */}
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
