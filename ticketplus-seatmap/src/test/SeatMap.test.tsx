import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SeatMap } from "../components/SeatMap";
import type { Seat, SectionId } from "../domain/types";

function makeSeat(id: string, section: SectionId, number: number, state: Seat["state"]): Seat {
  return {
    id,
    section,
    row: "A",
    number,
    price: 10000,
    state,
  };
}

describe("SeatMap", () => {
  it("no permite click en asiento OCCUPIED", () => {
    const onToggleSeat = vi.fn();

    const seats: Seat[] = [makeSeat("VIP-A1", "VIP", 1, "OCCUPIED")];

    render(
      <SeatMap
        seats={seats}
        selectedIds={new Set()}
        sections={["VIP"]}
        maxSeats={6}
        onToggleSeat={onToggleSeat}
      />
    );

    // El botón existe (número 1) y debe estar disabled
    const btn = screen.getByRole("button", { name: /asiento 1/i });
    expect(btn).toBeDisabled();

    fireEvent.click(btn);
    expect(onToggleSeat).not.toHaveBeenCalled();
  });

  it("llama onToggleSeat al click en asiento AVAILABLE", () => {
    const onToggleSeat = vi.fn();

    const seats: Seat[] = [makeSeat("VIP-A1", "VIP", 1, "AVAILABLE")];

    render(
      <SeatMap
        seats={seats}
        selectedIds={new Set()}
        sections={["VIP"]}
        maxSeats={6}
        onToggleSeat={onToggleSeat}
      />
    );

    const btn = screen.getByRole("button", { name: /asiento 1/i });
    expect(btn).not.toBeDisabled();

    fireEvent.click(btn);
    expect(onToggleSeat).toHaveBeenCalledWith("VIP-A1");
  });
});
    