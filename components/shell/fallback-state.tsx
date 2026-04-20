import Link from "next/link";

export function LoadingState({
  copy = "Подготавливаем экран и собираем данные из CRM.",
  title = "Загружаем <em>экран</em>",
}: {
  copy?: string;
  title?: string;
}) {
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
          maxWidth: 560,
          padding: "40px 36px",
          textAlign: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            border: "4px solid var(--line)",
            borderRadius: "999px",
            borderTopColor: "var(--emerald)",
            height: 56,
            margin: "0 auto 20px",
            width: 56,
          }}
        />
        <h1 dangerouslySetInnerHTML={{ __html: title }} style={{ fontFamily: "var(--f-display)", fontSize: 48, lineHeight: 1.02, margin: 0 }} />
        <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.8, margin: "14px 0 0" }}>{copy}</p>
      </div>
    </div>
  );
}

export function ErrorState({
  copy,
  homeHref = "/",
  homeLabel = "На главную",
  onRetry,
  title,
}: {
  copy: string;
  homeHref?: string;
  homeLabel?: string;
  onRetry?: () => void;
  title: string;
}) {
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
          maxWidth: 620,
          padding: "42px 38px",
          width: "100%",
        }}
      >
        <div style={{ color: "var(--muted)", fontSize: 11, fontWeight: 700, letterSpacing: 1.8, marginBottom: 12, textTransform: "uppercase" }}>
          HajjCRM · fallback
        </div>
        <h1 dangerouslySetInnerHTML={{ __html: title }} style={{ fontFamily: "var(--f-display)", fontSize: 54, lineHeight: 1.02, margin: 0 }} />
        <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.85, margin: "14px 0 24px" }}>{copy}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {onRetry ? (
            <button className="btn btn-dark btn-sm" onClick={onRetry} type="button">
              Попробовать снова
            </button>
          ) : null}
          <Link className="btn btn-ghost btn-sm" href={homeHref}>
            {homeLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
