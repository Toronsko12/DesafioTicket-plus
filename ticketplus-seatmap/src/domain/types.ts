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
