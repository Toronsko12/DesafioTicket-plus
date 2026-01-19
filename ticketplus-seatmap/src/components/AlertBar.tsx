import { styles } from "../styles/appStyles";

export function AlertBar({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div style={styles.alertWrap}>
      <div style={styles.alertCard}>{message}</div>
    </div>
  );
}
