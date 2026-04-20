import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div
      style={{
        alignItems: "center",
        background: "var(--cream)",
        display: "flex",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "32px",
      }}
    >
      <div
        style={{
          background: "var(--paper)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius)",
          maxWidth: 680,
          padding: "48px 42px",
          width: "100%",
        }}
      >
        <div style={{ color: "var(--muted)", fontSize: 11, fontWeight: 700, letterSpacing: 1.8, marginBottom: 14, textTransform: "uppercase" }}>
          HajjCRM · auth guard
        </div>
        <h1 style={{ fontFamily: "var(--f-display)", fontSize: 60, lineHeight: 1.02, margin: 0 }}>
          Доступ <em>запрещён</em>
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.85, margin: "16px 0 28px", maxWidth: 560 }}>
          У вашей текущей роли нет доступа к этому разделу. Вернитесь на подходящий маршрут или войдите под другим аккаунтом.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Link className="btn btn-dark btn-sm" href="/login">
            Войти заново
          </Link>
          <Link className="btn btn-ghost btn-sm" href="/">
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}
