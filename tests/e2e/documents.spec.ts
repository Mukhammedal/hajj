import { test, expect } from "./helpers";
import { Buffer } from "node:buffer";

/**
 * P0: Document upload + readiness recalculation.
 * Покрывает MIME/size validation, replace flow, cross-pilgrim isolation.
 */

// Минимальный валидный PDF — 1 пустая страница.
function makeMinimalPdf(): Buffer {
  return Buffer.from(
    "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n" +
      "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n" +
      "3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj\n" +
      "xref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n" +
      "0000000053 00000 n \n0000000098 00000 n \n" +
      "trailer<</Size 4/Root 1 0 R>>\nstartxref\n159\n%%EOF",
    "binary",
  );
}

function makeLargeFile(sizeMb: number): Buffer {
  return Buffer.alloc(sizeMb * 1024 * 1024, 0x41); // заполнено 'A'
}

async function cookieHeaderFor(page: { context(): { cookies(): Promise<Array<{ name: string; value: string }>> } }) {
  const cookies = await page.context().cookies();
  return cookies.map((c) => `${c.name}=${c.value}`).join("; ");
}

test.describe("documents: happy path", () => {
  test("D-01: загрузка валидного PDF → readiness обновляется", async ({
    pilgrimPage,
    request,
  }) => {
    // Делаем через API — не завязываемся на конкретный UI input.
    const cookieHeader = await cookieHeaderFor(pilgrimPage);

    const response = await request.post("/api/cabinet/documents/upload", {
      multipart: {
        type: "passport",
        file: {
          name: "passport-test.pdf",
          mimeType: "application/pdf",
          buffer: makeMinimalPdf(),
        },
      },
      headers: { cookie: cookieHeader },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.document).toBeTruthy();
    expect(body.document.type).toBe("passport");
    expect(body.document.fileName).toBe("passport-test.pdf");
    expect(body.readiness).toBeTruthy();
    expect(typeof body.readiness.readinessPercent).toBe("number");
  });
});

test.describe("documents: validation", () => {
  test("D-02: невалидный MIME отклоняется (400)", async ({ pilgrimPage, request }) => {
    const cookieHeader = await cookieHeaderFor(pilgrimPage);

    const response = await request.post("/api/cabinet/documents/upload", {
      multipart: {
        type: "passport",
        file: {
          name: "malicious.txt",
          mimeType: "text/plain",
          buffer: Buffer.from("not a pdf"),
        },
      },
      headers: { cookie: cookieHeader },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("PDF");
  });

  test("D-02b: .exe отклоняется", async ({ pilgrimPage, request }) => {
    const cookieHeader = await cookieHeaderFor(pilgrimPage);

    const response = await request.post("/api/cabinet/documents/upload", {
      multipart: {
        type: "passport",
        file: {
          name: "virus.exe",
          mimeType: "application/x-msdownload",
          buffer: Buffer.from("MZ\x90\x00"), // PE header префикс
        },
      },
      headers: { cookie: cookieHeader },
    });

    expect(response.status()).toBe(400);
  });

  test("D-03: файл > 5MB отклоняется", async ({ pilgrimPage, request }) => {
    const cookieHeader = await cookieHeaderFor(pilgrimPage);

    const response = await request.post("/api/cabinet/documents/upload", {
      multipart: {
        type: "passport",
        file: {
          name: "huge.pdf",
          mimeType: "application/pdf",
          buffer: makeLargeFile(6),
        },
      },
      headers: { cookie: cookieHeader },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("5 МБ");
  });

  test("D-03b: граничный случай — файл 5MB допускается", async ({
    pilgrimPage,
    request,
  }) => {
    const cookieHeader = await cookieHeaderFor(pilgrimPage);

    // 5 MB ровно на границе. В коде: `fileValue.size > MAX_DOCUMENT_FILE_SIZE` — значит 5MB должны пройти.
    const payload = Buffer.alloc(5 * 1024 * 1024, 0x20);
    const header = makeMinimalPdf();
    header.copy(payload, 0);

    const response = await request.post("/api/cabinet/documents/upload", {
      multipart: {
        type: "medical_certificate",
        file: {
          name: "boundary.pdf",
          mimeType: "application/pdf",
          buffer: payload,
        },
      },
      headers: { cookie: cookieHeader },
    });

    expect(response.status()).not.toBe(400);
  });

  test("D-02c: неверный type отклоняется", async ({ pilgrimPage, request }) => {
    const cookieHeader = await cookieHeaderFor(pilgrimPage);

    const response = await request.post("/api/cabinet/documents/upload", {
      multipart: {
        type: "hacker_type", // не в enum
        file: {
          name: "file.pdf",
          mimeType: "application/pdf",
          buffer: makeMinimalPdf(),
        },
      },
      headers: { cookie: cookieHeader },
    });

    expect(response.status()).toBe(400);
  });
});

test.describe("documents: replace flow", () => {
  test("D-04: загрузка поверх существующего сбрасывает is_verified", async ({
    pilgrimPage,
    request,
  }) => {
    const cookieHeader = await cookieHeaderFor(pilgrimPage);

    // Первая загрузка
    await request.post("/api/cabinet/documents/upload", {
      multipart: {
        type: "photo",
        file: { name: "photo-v1.pdf", mimeType: "application/pdf", buffer: makeMinimalPdf() },
      },
      headers: { cookie: cookieHeader },
    });

    // Повторная — должна перезаписать
    const response = await request.post("/api/cabinet/documents/upload", {
      multipart: {
        type: "photo",
        file: { name: "photo-v2.pdf", mimeType: "application/pdf", buffer: makeMinimalPdf() },
      },
      headers: { cookie: cookieHeader },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.document.fileName).toBe("photo-v2.pdf");
    expect(body.document.isVerified).toBe(false);
  });
});

test.describe("documents: cross-pilgrim isolation", () => {
  test("D-05: без сессии — 401", async ({ request }) => {
    const response = await request.post("/api/cabinet/documents/upload", {
      multipart: {
        type: "passport",
        file: {
          name: "any.pdf",
          mimeType: "application/pdf",
          buffer: makeMinimalPdf(),
        },
      },
    });

    expect(response.status()).toBe(401);
  });

  test("D-05b: оператор не имеет pilgrim_profile → 404", async ({
    operatorPage,
    request,
  }) => {
    const cookieHeader = await cookieHeaderFor(operatorPage);

    const response = await request.post("/api/cabinet/documents/upload", {
      multipart: {
        type: "passport",
        file: {
          name: "any.pdf",
          mimeType: "application/pdf",
          buffer: makeMinimalPdf(),
        },
      },
      headers: { cookie: cookieHeader },
    });

    // Код проверяет pilgrim_profiles по user_id — у оператора его нет → 404.
    // Если 200 — грубая дыра.
    expect([401, 403, 404]).toContain(response.status());
  });

  test("D-05c: admin без pilgrim_profile → 404", async ({ adminPage, request }) => {
    const cookieHeader = await cookieHeaderFor(adminPage);

    const response = await request.post("/api/cabinet/documents/upload", {
      multipart: {
        type: "passport",
        file: {
          name: "any.pdf",
          mimeType: "application/pdf",
          buffer: makeMinimalPdf(),
        },
      },
      headers: { cookie: cookieHeader },
    });

    expect([401, 403, 404]).toContain(response.status());
  });
});

test.describe("documents: UI rendering", () => {
  test("D-UI-01: документы страница открывается", async ({ pilgrimPage }) => {
    await pilgrimPage.goto("/cabinet/documents");
    await expect(pilgrimPage).toHaveURL(/\/cabinet\/documents/);
    // Должен быть хотя бы один input[type=file] для загрузки
    await expect(pilgrimPage.locator('input[type="file"]').first()).toBeAttached();
  });

  test("D-UI-02: readiness процент виден в кабинете", async ({ pilgrimPage }) => {
    await pilgrimPage.goto("/cabinet/dashboard");
    // На dashboard должна быть индикация готовности
    await expect(pilgrimPage.locator("text=/\\d+%/").first()).toBeVisible({ timeout: 5000 });
  });
});
