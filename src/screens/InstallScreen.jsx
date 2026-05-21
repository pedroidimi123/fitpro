export default function InstallScreen({ onClose }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#080808",
      color: "white",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
      textAlign: "center",
      gap: 16
    }}>
      <h1 style={{ fontSize: 28 }}>Instale o FitPro</h1>

      <p style={{ opacity: 0.7, maxWidth: 300 }}>
        Adicione o app na tela inicial para abrir mais rápido e ter melhor experiência.
      </p>

      <div style={{
        background: "#111",
        padding: 16,
        borderRadius: 12,
        fontSize: 14,
        opacity: 0.8,
        maxWidth: 320
      }}>
        No Chrome: Menu ⋮ → “Adicionar à tela inicial”
      </div>

      <button
        onClick={onClose}
        style={{
          marginTop: 10,
          padding: "12px 18px",
          borderRadius: 10,
          border: "none",
          background: "#ff7a00",
          color: "white",
          fontWeight: 600,
          cursor: "pointer"
        }}
      >
        Entendi
      </button>
    </div>
  );
}