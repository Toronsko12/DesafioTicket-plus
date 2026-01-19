import { money } from "../domain/utils";
import { styles } from "../styles/appStyles";

export function BottomBar({
  selectedCount,
  total,
  onClear,
  onReserve,
}: {
  selectedCount: number;
  total: number;
  onClear: () => void;
  onReserve: () => void;
}) {
  const disabled = selectedCount === 0;

  return (
    <div style={styles.bottomBar}>
      <div style={styles.bottomInner}>
        <div style={styles.bottomLeft}>
          <div style={{ fontWeight: 900 }}>
            {selectedCount > 0 ? `${selectedCount} asiento(s) seleccionado(s)` : "Sin asientos seleccionados"}
          </div>
          <div style={{ opacity: 0.85, fontSize: 13 }}>
            Total: <b>{money(total)}</b>
          </div>
        </div>

        <div style={styles.bottomRight}>
          <button
            onClick={onClear}
            disabled={disabled}
            style={{
              ...styles.btn,
              ...styles.btnSecondary,
              opacity: disabled ? 0.5 : 1,
              cursor: disabled ? "not-allowed" : "pointer",
            }}
          >
            Limpiar
          </button>

          <button
            onClick={onReserve}
            disabled={disabled}
            style={{
              ...styles.btn,
              ...styles.btnPrimary,
              opacity: disabled ? 0.5 : 1,
              cursor: disabled ? "not-allowed" : "pointer",
            }}
          >
            Reservar
          </button>
        </div>
      </div>
    </div>
  );
}
