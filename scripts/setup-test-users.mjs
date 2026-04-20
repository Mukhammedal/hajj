import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createClient } from "@supabase/supabase-js";

function loadEnvFile(filePath) {
  const raw = readFileSync(filePath, "utf8");
  const env = {};

  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    env[key] = value;
  });

  return env;
}

const env = loadEnvFile(resolve(process.cwd(), ".env.local"));
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase env vars in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const users = [
  {
    email: "admin@hajjcrm.kz",
    password: "Admin_2026_Hajj!",
    role: "admin",
  },
  {
    email: "operator@test.kz",
    password: "Operator_2026_Hajj!",
    role: "operator",
  },
  {
    email: "pilgrim@test.kz",
    password: "Pilgrim_2026_Hajj!",
    role: "pilgrim",
  },
];

async function listAllUsers() {
  const allUsers = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      throw error;
    }

    const batch = data?.users ?? [];
    allUsers.push(...batch);

    if (batch.length < 200) {
      break;
    }

    page += 1;
  }

  return allUsers;
}

async function ensureUser({ email, password, role }) {
  const users = await listAllUsers();
  const existing = users.find((user) => user.email?.toLowerCase() === email.toLowerCase());

  if (existing) {
    const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      app_metadata: {
        ...(existing.app_metadata ?? {}),
        role,
      },
      email_confirm: true,
    });

    if (error) {
      throw error;
    }

    return data.user;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role },
  });

  if (error || !data.user) {
    throw error ?? new Error(`Failed to create ${email}`);
  }

  return data.user;
}

async function ensureOperatorProfile(userId) {
  const { data: existing, error: existingError } = await supabase
    .from("operators")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existing) {
    return existing.id;
  }

  const { data, error } = await supabase
    .from("operators")
    .insert({
      user_id: userId,
      company_name: "Тестовый оператор",
      license_number: "LIC-HAJJCRM-TEST-2026",
      license_expiry: "2027-01-01",
      is_verified: true,
      phone: "+7 700 000 00 00",
      address: "Алматы",
    })
    .select("id")
    .maybeSingle();

  if (error || !data) {
    throw error ?? new Error("Failed to create operator profile");
  }

  return data.id;
}

async function ensurePilgrimProfile(userId, operatorId) {
  const { data: existing, error: existingError } = await supabase
    .from("pilgrim_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existing) {
    return existing.id;
  }

  const { data, error } = await supabase
    .from("pilgrim_profiles")
    .insert({
      user_id: userId,
      operator_id: operatorId,
      full_name: "Тестовый паломник",
      iin: "880101350555",
      phone: "+7 700 111 22 33",
      date_of_birth: "1988-01-01",
      gender: "male",
      status: "new",
    })
    .select("id")
    .maybeSingle();

  if (error || !data) {
    throw error ?? new Error("Failed to create pilgrim profile");
  }

  const checklistTemplates = [
    { item_name: "Паспорт проверен", category: "documents" },
    { item_name: "Медицинская аптечка", category: "health" },
    { item_name: "Ихрам и базовая одежда", category: "clothing" },
    { item_name: "Наличные и карта", category: "finance" },
    { item_name: "Дуа и памятка по обрядам", category: "spiritual" },
  ];

  await Promise.all([
    supabase.from("payments").insert({
      pilgrim_id: data.id,
      operator_id: operatorId,
      total_amount: 0,
      paid_amount: 0,
      payment_method: "transfer",
      installment_plan: false,
      status: "pending",
    }),
    supabase.from("checklist_items").insert(
      checklistTemplates.map((item) => ({
        pilgrim_id: data.id,
        item_name: item.item_name,
        category: item.category,
      })),
    ),
    supabase.from("notifications").insert({
      pilgrim_id: data.id,
      operator_id: operatorId,
      channel: "in_app",
      type: "welcome",
      message: "Добро пожаловать в кабинет паломника. Загрузите документы и проверьте статус оплаты.",
      status: "queued",
      scheduled_at: new Date().toISOString(),
    }),
  ]);

  return data.id;
}

async function main() {
  const [adminUser, operatorUser, pilgrimUser] = await Promise.all(users.map(ensureUser));
  const operatorId = await ensureOperatorProfile(operatorUser.id);
  const pilgrimId = await ensurePilgrimProfile(pilgrimUser.id, operatorId);

  console.log("Test users ready:");
  console.log(`admin   ${adminUser.email}   ${adminUser.id}`);
  console.log(`operator ${operatorUser.email} ${operatorUser.id} operator_id=${operatorId}`);
  console.log(`pilgrim ${pilgrimUser.email} ${pilgrimUser.id} pilgrim_id=${pilgrimId}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
