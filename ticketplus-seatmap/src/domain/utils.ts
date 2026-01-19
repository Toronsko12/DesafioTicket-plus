import type { Seat, SectionId } from "./types";

export function money(n: number) {
  return `$${n.toLocaleString("es-CL")} CLP`;
}

export function seatLabel(seat: Seat) {
  return `${seat.section} ${seat.row}${seat.number}`;
}

export function sectionMeta(sec: SectionId) {
  switch (sec) {
    case "VIP":
      return { name: "Sección A (VIP)", hint: "Mejor vista / más cerca" };
    case "PLATEA":
      return { name: "Sección B (Platea)", hint: "Balance precio / vista" };
    case "GENERAL":
      return { name: "Sección C (General)", hint: "Más económica" };
  }
}

export function groupByRow(seats: Seat[]) {
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

export function formatMs(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
