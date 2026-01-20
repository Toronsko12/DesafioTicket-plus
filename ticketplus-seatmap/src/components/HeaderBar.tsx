/**
 * HeaderBar
 *
 * Barra superior fija (sticky) que muestra el contexto del evento y,
 * cuando corresponde, el temporizador de retención (hold) de la selección.
 * `showTimer` controla que el contador no se muestre hasta que el usuario
 * seleccione al menos un asiento.
 */
import { styles } from "../styles/appStyles";

export function HeaderBar({
  brand,
  title,
  venue,
  dateText,
  address,
  timerLabel,
  timerValue,
  showTimer,
}: {
  brand: string;
  title: string;
  venue: string;
  dateText: string;
  address: string;
  timerLabel: string;
  timerValue: string;
  showTimer: boolean;
}) {
  return (
    <div style={styles.header}>
      <div style={styles.headerInner}>
        <div>
          <div style={styles.brand}>{brand}</div>
          <h1 style={styles.h1}>{title}</h1>
        </div>
        {showTimer && (
          <div style={styles.headerPill}>
            <div style={{ fontSize: 12, opacity: 0.85 }}>{timerLabel}</div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>{timerValue}</div>
          </div>
        )}
      </div>
    </div>
  );
}
