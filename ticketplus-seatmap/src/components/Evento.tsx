/**
 * Evento
 *
 * Componente visual principal (hero) del evento.
 * Muestra la imagen destacada, título y subtítulo del evento,
 * actuando como cabecera contextual de la experiencia de compra.
 * Está pensado para ser reutilizable y completamente declarativo.
 */
type EventHeroProps = {
  imageUrl: string;
  title: string;
  subtitle: string;
};

export function Evento({ imageUrl, title, subtitle }: EventHeroProps) {
  return (
    <div
      style={{
        width: "100%",
        position: "relative",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
        background: "#111",
      }}
    >
      <img
        src={imageUrl}
        alt={title}
        style={{
          width: "100%",
          height: 360,
          objectFit: "cover",
          display: "block",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.78), rgba(0,0,0,0.25), transparent)",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: 22,
          left: 22,
          right: 22,
          color: "#fff",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 900, lineHeight: 1.1 }}>
          {title}
        </h1>
        <div style={{ marginTop: 6, fontSize: 16, opacity: 0.92 }}>
          {subtitle}
        </div>
      </div>
    </div>
  );
}
