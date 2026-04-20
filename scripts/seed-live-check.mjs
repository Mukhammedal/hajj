const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase env vars.");
  process.exit(1);
}

const seedTag = "LIVE-SEED-20260420";
const authHeaders = {
  apikey: serviceRoleKey,
  Authorization: `Bearer ${serviceRoleKey}`,
};

const operatorSpec = {
  email: "operator.live.seed@hajjcrm.kz",
  password: "Operator_Live_Seed_2026!",
  role: "operator",
  companyName: "Al Noor Hajj Travel",
  licenseNumber: "LIC-2026-LIVE-SEED",
  licenseExpiry: "2027-12-31",
  phone: "+7 701 555 10 10",
  address: "Алматы, пр. Абая 101",
};

const groupSpec = {
  name: "Хадж 2026 | Live Seed Group",
  flightDate: "2026-06-15",
  returnDate: "2026-07-02",
  hotelMecca: "Swissotel Makkah",
  hotelMedina: "Anwar Al Madinah",
  quotaTotal: 40,
  guideName: "Нурлан Сеитов",
  guidePhone: "+7 701 555 20 20",
  departureCity: "Almaty",
  status: "forming",
};

const pilgrims = [
  {
    email: "pilgrim.seed.amina@hajjcrm.kz",
    password: "Pilgrim_Amina_2026!",
    role: "pilgrim",
    fullName: "Амина Серикова",
    iin: "900101400101",
    phone: "+7 700 100 10 01",
    dateOfBirth: "1990-01-01",
    gender: "female",
    profileStatus: "ready",
    docs: ["passport", "medical_certificate", "photo", "questionnaire", "vaccination"],
    payment: {
      totalAmount: 1600000,
      paidAmount: 1600000,
      paymentMethod: "transfer",
      installmentPlan: false,
      installmentMonths: null,
      status: "paid",
      qrCode: "LIVE-SEED-QR-AMINA-2026",
    },
    inGroup: true,
    expectedReadiness: 100,
  },
  {
    email: "pilgrim.seed.marat@hajjcrm.kz",
    password: "Pilgrim_Marat_2026!",
    role: "pilgrim",
    fullName: "Марат Жаксылыков",
    iin: "910202400202",
    phone: "+7 700 100 10 02",
    dateOfBirth: "1991-02-02",
    gender: "male",
    profileStatus: "payment_partial",
    docs: ["passport", "medical_certificate", "photo", "questionnaire", "vaccination"],
    payment: {
      totalAmount: 1620000,
      paidAmount: 900000,
      paymentMethod: "kaspi",
      installmentPlan: true,
      installmentMonths: 3,
      status: "partial",
      qrCode: "LIVE-SEED-QR-MARAT-2026",
    },
    inGroup: true,
    expectedReadiness: 86,
  },
  {
    email: "pilgrim.seed.dana@hajjcrm.kz",
    password: "Pilgrim_Dana_2026!",
    role: "pilgrim",
    fullName: "Дана Ергалиева",
    iin: "920303400303",
    phone: "+7 700 100 10 03",
    dateOfBirth: "1992-03-03",
    gender: "female",
    profileStatus: "docs_pending",
    docs: ["passport", "medical_certificate", "photo"],
    payment: {
      totalAmount: 1580000,
      paidAmount: 1580000,
      paymentMethod: "cash",
      installmentPlan: false,
      installmentMonths: null,
      status: "paid",
      qrCode: "LIVE-SEED-QR-DANA-2026",
    },
    inGroup: false,
    expectedReadiness: 57,
  },
  {
    email: "pilgrim.seed.bekzat@hajjcrm.kz",
    password: "Pilgrim_Bekzat_2026!",
    role: "pilgrim",
    fullName: "Бекзат Алимов",
    iin: "930404400404",
    phone: "+7 700 100 10 04",
    dateOfBirth: "1993-04-04",
    gender: "male",
    profileStatus: "new",
    docs: [],
    payment: {
      totalAmount: 1500000,
      paidAmount: 0,
      paymentMethod: "halyk",
      installmentPlan: true,
      installmentMonths: 4,
      status: "pending",
      qrCode: "LIVE-SEED-QR-BEKZAT-2026",
    },
    inGroup: false,
    expectedReadiness: 0,
  },
];

const tinyPngBytes = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO3Z9x8AAAAASUVORK5CYII=",
  "base64",
);

function buildPdfBuffer(label) {
  const safeLabel = label.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  const stream = `BT\n/F1 16 Tf\n50 780 Td\n(${safeLabel}) Tj\n0 -24 Td\n(${seedTag}) Tj\nET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const startXref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF`;

  return Buffer.from(pdf, "utf8");
}

async function requestJson(url, init = {}) {
  const response = await fetch(url, init);
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${JSON.stringify(payload)}`);
  }

  return payload;
}

async function restSelect(table, query = "") {
  return requestJson(`${supabaseUrl}/rest/v1/${table}${query}`, {
    headers: {
      ...authHeaders,
      Accept: "application/json",
    },
  });
}

async function restInsert(table, body, query = "", prefer = "return=representation") {
  return requestJson(`${supabaseUrl}/rest/v1/${table}${query}`, {
    method: "POST",
    headers: {
      ...authHeaders,
      "Content-Type": "application/json",
      Prefer: prefer,
    },
    body: JSON.stringify(body),
  });
}

async function restUpdate(table, filterQuery, body) {
  return requestJson(`${supabaseUrl}/rest/v1/${table}${filterQuery}`, {
    method: "PATCH",
    headers: {
      ...authHeaders,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  });
}

async function restDelete(table, filterQuery) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}${filterQuery}`, {
    method: "DELETE",
    headers: {
      ...authHeaders,
      Prefer: "return=minimal",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${text}`);
  }
}

async function listAuthUsers() {
  const payload = await requestJson(`${supabaseUrl}/auth/v1/admin/users?page=1&perPage=200`, {
    headers: {
      ...authHeaders,
      "Content-Type": "application/json",
    },
  });

  return payload.users ?? [];
}

async function ensureAuthUser({ email, password, role }) {
  const users = await listAuthUsers();
  const existing = users.find((user) => user.email?.toLowerCase() === email.toLowerCase());

  if (existing) {
    await requestJson(`${supabaseUrl}/auth/v1/admin/users/${existing.id}`, {
      method: "PUT",
      headers: {
        ...authHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password,
        email_confirm: true,
        app_metadata: { role },
      }),
    });

    return existing;
  }

  return requestJson(`${supabaseUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      ...authHeaders,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      app_metadata: { role },
    }),
  });
}

async function uploadToStorage(path, contentType, body) {
  const response = await fetch(`${supabaseUrl}/storage/v1/object/documents/${path}`, {
    method: "POST",
    headers: {
      ...authHeaders,
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body,
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${text}`);
  }

  return text ? JSON.parse(text) : null;
}

function documentBufferForType(type, pilgrimName) {
  if (type === "photo") {
    return {
      body: tinyPngBytes,
      contentType: "image/png",
      extension: "png",
    };
  }

  return {
    body: buildPdfBuffer(`${type} | ${pilgrimName}`),
    contentType: "application/pdf",
    extension: "pdf",
  };
}

async function ensureOperator(userId) {
  const existing = await restSelect("operators", `?select=*&license_number=eq.${operatorSpec.licenseNumber}`);

  if (existing.length) {
    const [updated] = await restUpdate(`operators`, `?id=eq.${existing[0].id}`, {
      user_id: userId,
      company_name: operatorSpec.companyName,
      license_expiry: operatorSpec.licenseExpiry,
      is_verified: true,
      phone: operatorSpec.phone,
      address: operatorSpec.address,
    });
    return updated;
  }

  const [created] = await restInsert("operators", {
    user_id: userId,
    company_name: operatorSpec.companyName,
    license_number: operatorSpec.licenseNumber,
    license_expiry: operatorSpec.licenseExpiry,
    is_verified: true,
    phone: operatorSpec.phone,
    address: operatorSpec.address,
  });

  return created;
}

async function ensureGroup(operatorId) {
  const existing = await restSelect(
    "groups",
    `?select=*&operator_id=eq.${operatorId}&name=eq.${encodeURIComponent(groupSpec.name)}`,
  );

  if (existing.length) {
    const [updated] = await restUpdate(`groups`, `?id=eq.${existing[0].id}`, {
      operator_id: operatorId,
      name: groupSpec.name,
      flight_date: groupSpec.flightDate,
      return_date: groupSpec.returnDate,
      hotel_mecca: groupSpec.hotelMecca,
      hotel_medina: groupSpec.hotelMedina,
      quota_total: groupSpec.quotaTotal,
      guide_name: groupSpec.guideName,
      guide_phone: groupSpec.guidePhone,
      departure_city: groupSpec.departureCity,
      status: groupSpec.status,
    });
    return updated;
  }

  const [created] = await restInsert("groups", {
    operator_id: operatorId,
    name: groupSpec.name,
    flight_date: groupSpec.flightDate,
    return_date: groupSpec.returnDate,
    hotel_mecca: groupSpec.hotelMecca,
    hotel_medina: groupSpec.hotelMedina,
    quota_total: groupSpec.quotaTotal,
    guide_name: groupSpec.guideName,
    guide_phone: groupSpec.guidePhone,
    departure_city: groupSpec.departureCity,
    status: groupSpec.status,
  });

  return created;
}

async function ensurePilgrimProfile(pilgrimUserId, operatorId, pilgrim) {
  const existing = await restSelect("pilgrim_profiles", `?select=*&iin=eq.${pilgrim.iin}`);

  if (existing.length) {
    const [updated] = await restUpdate(`pilgrim_profiles`, `?id=eq.${existing[0].id}`, {
      user_id: pilgrimUserId,
      operator_id: operatorId,
      full_name: pilgrim.fullName,
      phone: pilgrim.phone,
      date_of_birth: pilgrim.dateOfBirth,
      gender: pilgrim.gender,
      status: pilgrim.profileStatus,
    });
    return updated;
  }

  const [created] = await restInsert("pilgrim_profiles", {
    user_id: pilgrimUserId,
    operator_id: operatorId,
    full_name: pilgrim.fullName,
    iin: pilgrim.iin,
    phone: pilgrim.phone,
    date_of_birth: pilgrim.dateOfBirth,
    gender: pilgrim.gender,
    status: pilgrim.profileStatus,
  });

  return created;
}

async function upsertPayment(pilgrimId, operatorId, pilgrim) {
  const existing = await restSelect("payments", `?select=*&pilgrim_id=eq.${pilgrimId}`);
  const payload = {
    pilgrim_id: pilgrimId,
    operator_id: operatorId,
    total_amount: pilgrim.payment.totalAmount,
    paid_amount: pilgrim.payment.paidAmount,
    payment_method: pilgrim.payment.paymentMethod,
    installment_plan: pilgrim.payment.installmentPlan,
    installment_months: pilgrim.payment.installmentMonths,
    status: pilgrim.payment.status,
    qr_code: pilgrim.payment.qrCode,
    contract_generated_at: pilgrim.payment.status === "paid" ? new Date().toISOString() : null,
  };

  let payment;

  if (existing.length) {
    [payment] = await restUpdate("payments", `?id=eq.${existing[0].id}`, payload);
  } else {
    [payment] = await restInsert("payments", payload);
  }

  if (pilgrim.payment.status === "paid") {
    const contractPath = `${pilgrimId}/contracts/${pilgrim.payment.qrCode}.pdf`;
    await uploadToStorage(contractPath, "application/pdf", buildPdfBuffer(`contract | ${pilgrim.fullName}`));
    [payment] = await restUpdate("payments", `?id=eq.${payment.id}`, {
      contract_url: contractPath,
      contract_generated_at: new Date().toISOString(),
      qr_code: pilgrim.payment.qrCode,
    });
  }

  return payment;
}

async function syncGroupLinks(pilgrimProfiles, groupId) {
  const pilgrimIds = pilgrimProfiles.map((item) => item.id);
  await restDelete("pilgrim_groups", `?pilgrim_id=in.(${pilgrimIds.join(",")})`);

  const toAssign = pilgrimProfiles.filter((item) => item.inGroup);

  if (!toAssign.length) {
    return;
  }

  await restInsert(
    "pilgrim_groups",
    toAssign.map((item) => ({
      pilgrim_id: item.id,
      group_id: groupId,
      joined_at: new Date().toISOString(),
    })),
    "",
    "return=representation,resolution=merge-duplicates",
  );
}

async function syncDocuments(pilgrimProfile, pilgrim) {
  const current = await restSelect("documents", `?select=id,type&pilgrim_id=eq.${pilgrimProfile.id}`);
  const currentTypes = new Set(current.map((item) => item.type));
  const nextTypes = new Set(pilgrim.docs);

  for (const row of current) {
    if (!nextTypes.has(row.type)) {
      await restDelete("documents", `?id=eq.${row.id}`);
    }
  }

  for (const type of pilgrim.docs) {
    const file = documentBufferForType(type, pilgrim.fullName);
    const path = `${pilgrimProfile.id}/${type}/${seedTag}-${type}.${file.extension}`;
    await uploadToStorage(path, file.contentType, file.body);
    await restInsert(
      "documents",
      {
        pilgrim_id: pilgrimProfile.id,
        type,
        file_url: path,
        file_name: `${seedTag}-${type}.${file.extension}`,
        is_verified: type !== "questionnaire",
        uploaded_at: new Date().toISOString(),
      },
      "?on_conflict=pilgrim_id,type",
      "return=representation,resolution=merge-duplicates",
    );
  }
}

async function syncWelcomeNotification(pilgrimId, operatorId) {
  const existing = await restSelect(
    "notifications",
    `?select=id&pilgrim_id=eq.${pilgrimId}&type=eq.welcome&message=eq.${encodeURIComponent(`Добро пожаловать в кабинет паломника. Seed: ${seedTag}`)}`,
  );

  if (existing.length) {
    return;
  }

  await restInsert("notifications", {
    pilgrim_id: pilgrimId,
    operator_id: operatorId,
    channel: "in_app",
    type: "welcome",
    message: `Добро пожаловать в кабинет паломника. Seed: ${seedTag}`,
    status: "queued",
    scheduled_at: new Date().toISOString(),
  });
}

async function queryReadiness(pilgrimIds) {
  return restSelect("pilgrim_readiness_view", `?select=*&pilgrim_id=in.(${pilgrimIds.join(",")})&order=pilgrim_id`);
}

async function main() {
  const operatorAuth = await ensureAuthUser(operatorSpec);
  const operatorUserId = operatorAuth.user?.id ?? operatorAuth.id;
  const operator = await ensureOperator(operatorUserId);
  const group = await ensureGroup(operator.id);

  const pilgrimProfiles = [];

  for (const pilgrim of pilgrims) {
    const authUser = await ensureAuthUser(pilgrim);
    const authUserId = authUser.user?.id ?? authUser.id;
    const profile = await ensurePilgrimProfile(authUserId, operator.id, pilgrim);
    const profileWithSeed = { ...profile, inGroup: pilgrim.inGroup, spec: pilgrim };
    pilgrimProfiles.push(profileWithSeed);
    await upsertPayment(profile.id, operator.id, pilgrim);
    await syncDocuments(profile, pilgrim);
    await syncWelcomeNotification(profile.id, operator.id);
  }

  await syncGroupLinks(pilgrimProfiles, group.id);

  const readiness = await queryReadiness(pilgrimProfiles.map((item) => item.id));
  const readinessByPilgrim = new Map(readiness.map((item) => [item.pilgrim_id, item]));

  const mismatches = pilgrimProfiles
    .map((item) => {
      const actual = readinessByPilgrim.get(item.id);
      return {
        fullName: item.spec.fullName,
        actual: actual?.readiness_percent ?? null,
        expected: item.spec.expectedReadiness,
        qrCode: item.spec.payment.qrCode,
      };
    })
    .filter((item) => item.actual !== item.expected);

  console.log(JSON.stringify(
    {
      seedTag,
      operator: {
        email: operatorSpec.email,
        password: operatorSpec.password,
        operatorId: operator.id,
        companyName: operator.company_name,
      },
      group: {
        id: group.id,
        name: group.name,
        flightDate: group.flight_date,
      },
      pilgrims: pilgrimProfiles.map((item) => ({
        fullName: item.spec.fullName,
        email: item.spec.email,
        password: item.spec.password,
        pilgrimId: item.id,
        expectedReadiness: item.spec.expectedReadiness,
        actualReadiness: readinessByPilgrim.get(item.id)?.readiness_percent ?? null,
        qrCode: item.spec.payment.qrCode,
      })),
      readinessCheck: mismatches.length ? { ok: false, mismatches } : { ok: true },
      verifyPath: `/verify/${pilgrims[0].payment.qrCode}`,
    },
    null,
    2,
  ));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
