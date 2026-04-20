import Link from "next/link";

export default function NotFound() {
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
          maxWidth: 720,
          padding: "48px 42px",
          width: "100%",
        }}
      >
        <div style={{ color: "var(--muted)", fontSize: 11, fontWeight: 700, letterSpacing: 1.8, marginBottom: 14, textTransform: "uppercase" }}>
          404 · HajjCRM
        </div>
        <h1 style={{ fontFamily: "var(--f-display)", fontSize: 64, lineHeight: 1.02, margin: 0 }}>
          Страница <em>не найдена</em>
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.9, margin: "16px 0 28px", maxWidth: 560 }}>
          Возможно, ссылка устарела, slug изменился или маршрут ещё не связан с данными. Вернитесь в публичную часть, кабинет
          паломника или CRM и продолжите навигацию оттуда.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Link className="btn btn-dark btn-sm" href="/">
            На главную
          </Link>
          <Link className="btn btn-ghost btn-sm" href="/crm/dashboard">
            В CRM
          </Link>
          <Link className="btn btn-ghost btn-sm" href="/cabinet/dashboard">
            В кабинет
          </Link>
        </div>
      </div>
    </div>
  );
}
