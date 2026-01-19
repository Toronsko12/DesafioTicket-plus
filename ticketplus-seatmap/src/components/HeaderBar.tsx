import { styles } from "../styles/appStyles";

export function HeaderBar({
  brand,
  title,
  venue,
  dateText,
  address,
  timerLabel,
  timerValue,
}: {
  brand: string;
  title: string;
  venue: string;
  dateText: string;
  address: string;
  timerLabel: string;
  timerValue: string;
}) {
  return (
    <div style={styles.header}>
      <div style={styles.headerInner}>
        <div>
          <div style={styles.brand}>{brand}</div>
          <h1 style={styles.h1}>{title}</h1>
          <div style={styles.metaRow}>
            <span>{venue}</span>
            <span style={styles.dot}>•</span>
            <span>{dateText}</span>
          </div>
          <div style={styles.metaRow}>
            <span style={{ opacity: 0.85 }}>{address}</span>
          </div>
        </div>

        <div style={styles.headerPill}>
          <div style={{ fontSize: 12, opacity: 0.85 }}>{timerLabel}</div>
          <div style={{ fontSize: 18, fontWeight: 900 }}>{timerValue}</div>
        </div>
      </div>
    </div>
  );
}
