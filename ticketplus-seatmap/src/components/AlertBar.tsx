import { styles } from "../styles/appStyles";

/**
 * Barra de alerta informativa.
 * Se muestra solo cuando existe un mensaje (éxito, error, timeout, etc.).
 *
 * - `message`: si es null/empty, el componente no renderiza nada.
 */
export function AlertBar({ message }: { message: string | null }) {
  // Guard clause: si no hay mensaje, no se renderiza la barra
  if (!message) return null;

  return (
    <div style={styles.alertWrap}>
      {/* Card con estilo consistente con el resto del layout */}
      <div style={styles.alertCard}>{message}</div>
    </div>
  );
}
