import type { Seat, SectionId, SeatState } from "./types";

export const EVENT = {
  title: "SHOW DEMO - NOCHE ÍNTIMA",
  venue: "Venue Demo Santiago",
  dateText: "Sábado 24 Ene · 21:00",
  address: "Av. Demo 123, Santiago",
};

export function buildSeats(): Seat[] {
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
