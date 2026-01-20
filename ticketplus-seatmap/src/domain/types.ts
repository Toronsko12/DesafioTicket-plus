/**
 * types
 *
 * Tipos base del dominio para el flujo de selección de asientos.
 * Se usan para mantener tipado estricto en toda la app (secciones, estados y asientos).
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
