import { formatKzt } from "@/lib/format";
import type { Operator, OperatorReview, PaymentRecord, PilgrimProfile } from "@/types/domain";

type AdminBundleLike = {
  operators: Operator[];
  payments: PaymentRecord[];
  pilgrims: PilgrimProfile[];
  reviews: OperatorReview[];
};

type VerificationStatus = "pending" | "verified" | "rejected";

export type AdminVerificationRow = {
  city: string;
  companyName: string;
  id?: string;
  isVerified: boolean;
  licenseNumber: string;
  status: VerificationStatus;
  submittedAt: string;
};

export type AdminTopOperator = {
  name: string;
  rank: string;
  revenue: number;
  revenueLabel: string;
  width: number;
};

export type AdminComplaint = {
  amount: string;
  createdAt: string;
  operator: string;
  pilgrim: string;
  reason: string;
  status: string;
  tone: "danger" | "warning";
};

export const adminVerificationDocuments = [
  {
    meta: "3 стр · 180 КБ",
    title: "Свидетельство ДУМК",
  },
  {
    meta: "2 стр · 120 КБ",
    title: "Туроператорская лицензия № 04-тур",
  },
  {
    meta: "6 стр · 410 КБ",
    title: "Устав и ЭЦП директора",
  },
] as const;

export const adminVerificationHistory = [
  {
    detail: "модератор Айдар К.",
    label: "✓ Al-Madinah Travel · approved",
    tone: "var(--success)",
    when: "20.04 · 11:08",
  },
  {
    detail: "«Истёкшая лицензия ДУМК»",
    label: "✕ Mecca Direct KZ · rejected",
    tone: "var(--danger)",
    when: "18.04 · 14:22",
  },
  {
    detail: "модератор Айдар К.",
    label: "✓ Hajj Expert Group · approved",
    tone: "var(--success)",
    when: "10.04 · 09:40",
  },
  {
    detail: "модератор Санжар Б.",
    label: "✓ Baraka Hajj · approved",
    tone: "var(--success)",
    when: "02.04 · 16:15",
  },
  {
    detail: "«Нет страхования ответственности»",
    label: "✕ Fast Umrah · rejected",
    tone: "var(--danger)",
    when: "28.03 · 10:30",
  },
] as const;

const fallbackVerificationRows: AdminVerificationRow[] = [
  {
    city: "Алматы",
    companyName: "Aqniet Hajj Tours",
    isVerified: false,
    licenseNumber: "KZ-HJ-2026-048",
    status: "pending",
    submittedAt: "19.04.2026",
  },
  {
    city: "Шымкент",
    companyName: "Haj Kazakhstan Ltd",
    isVerified: false,
    licenseNumber: "KZ-HJ-2026-049",
    status: "pending",
    submittedAt: "18.04.2026",
  },
  {
    city: "Астана",
    companyName: "Salam Tourism",
    isVerified: false,
    licenseNumber: "KZ-HJ-2026-050",
    status: "pending",
    submittedAt: "16.04.2026",
  },
  {
    city: "Туркестан",
    companyName: "Mecca Direct KZ",
    isVerified: false,
    licenseNumber: "KZ-HJ-2026-046",
    status: "rejected",
    submittedAt: "14.04.2026",
  },
  {
    city: "Актау",
    companyName: "Al-Madinah Travel",
    isVerified: true,
    licenseNumber: "KZ-HJ-2026-047",
    status: "verified",
    submittedAt: "12.04.2026",
  },
  {
    city: "Алматы",
    companyName: "Nur Safar",
    isVerified: false,
    licenseNumber: "KZ-HJ-2026-051",
    status: "pending",
    submittedAt: "08.04.2026",
  },
  {
    city: "Астана",
    companyName: "Hajj Expert Group",
    isVerified: true,
    licenseNumber: "KZ-HJ-2026-052",
    status: "verified",
    submittedAt: "05.04.2026",
  },
  {
    city: "Шымкент",
    companyName: "Dar Al Hajj Services",
    isVerified: false,
    licenseNumber: "KZ-HJ-2026-053",
    status: "pending",
    submittedAt: "03.04.2026",
  },
] as const;

const fallbackTopOperators = [
  ["Zamzam Group Kazakhstan", 184.2],
  ["Al-Safa Hajj Travel", 98.4],
  ["Nur Iman Tours", 74.8],
  ["Baraka Hajj Services", 58.2],
  ["Hajj Expert Group", 48.4],
  ["Al-Madinah Travel", 39.8],
  ["Salam Tourism", 32.1],
  ["Aqniet Hajj Tours", 25.6],
  ["Nur Safar", 20.8],
  ["Haj Kazakhstan Ltd", 17.4],
] as const;

const fallbackComplaints: AdminComplaint[] = [
  {
    amount: "2 400 000 ₸",
    createdAt: "15.04.2026",
    operator: "Mecca Direct KZ",
    pilgrim: "Арман Смагулов",
    reason: "Отель ниже класса, чем в договоре",
    status: "В работе",
    tone: "warning",
  },
  {
    amount: "680 000 ₸",
    createdAt: "08.04.2026",
    operator: "Fast Umrah",
    pilgrim: "Салтанат К.",
    reason: "Задержка возврата после отмены",
    status: "Запрошены документы",
    tone: "warning",
  },
  {
    amount: "1 980 000 ₸",
    createdAt: "02.04.2026",
    operator: "Haj Kazakhstan Ltd",
    pilgrim: "Ермек Абишев",
    reason: "Группа не собрана, перенос на 2027",
    status: "Рефанд",
    tone: "danger",
  },
] as const;

const verificationCities = ["Алматы", "Шымкент", "Астана", "Туркестан", "Актау"] as const;

function formatShortDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function compactMillionKzt(amount: number) {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M ₸`;
  }

  return formatKzt(amount);
}

function resolveOperatorCity(operator: Operator, index: number) {
  const address = operator.address?.trim();

  if (!address) {
    return verificationCities[index % verificationCities.length];
  }

  const matched = verificationCities.find((city) => address.toLowerCase().includes(city.toLowerCase()));
  return matched ?? address.split(",")[0] ?? verificationCities[index % verificationCities.length];
}

function resolveRevenueForOperator(payments: PaymentRecord[], operatorId: string) {
  return payments.filter((payment) => payment.operatorId === operatorId).reduce((sum, payment) => sum + payment.paidAmount, 0);
}

export function buildAdminVerificationRows(bundle: AdminBundleLike) {
  const liveRows = [...bundle.operators]
    .sort((left, right) => {
      if (left.isVerified === right.isVerified) {
        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      }

      return left.isVerified ? 1 : -1;
    })
    .map((operator, index) => ({
      city: resolveOperatorCity(operator, index),
      companyName: operator.companyName,
      id: operator.id,
      isVerified: operator.isVerified,
      licenseNumber: operator.licenseNumber,
      status: operator.isVerified ? ("verified" as const) : ("pending" as const),
      submittedAt: formatShortDate(operator.createdAt),
    }));

  if (liveRows.length >= 8) {
    return liveRows.slice(0, 8);
  }

  return [...liveRows, ...fallbackVerificationRows.slice(liveRows.length, 8)];
}

export function buildAdminTopOperators(bundle: AdminBundleLike): AdminTopOperator[] {
  const liveRows = bundle.operators
    .map((operator) => ({
      name: operator.companyName,
      revenue: resolveRevenueForOperator(bundle.payments, operator.id),
    }))
    .filter((item) => item.revenue > 0)
    .sort((left, right) => right.revenue - left.revenue)
    .slice(0, 10);

  const rows =
    liveRows.length >= 5
      ? liveRows
      : fallbackTopOperators.map(([name, amount]) => ({
          name,
          revenue: amount * 1_000_000,
        }));

  const maxRevenue = rows[0]?.revenue || 1;

  return rows.slice(0, 10).map((row, index) => ({
    name: row.name,
    rank: String(index + 1).padStart(2, "0"),
    revenue: row.revenue,
    revenueLabel: compactMillionKzt(row.revenue),
    width: Math.max(14, Math.round((row.revenue / maxRevenue) * 100)),
  }));
}

export function buildAdminComplaints(bundle: AdminBundleLike): AdminComplaint[] {
  const lowReviews = bundle.reviews.filter((review) => review.rating <= 3).slice(0, 3);

  if (!lowReviews.length) {
    return [...fallbackComplaints];
  }

  return lowReviews.map((review, index) => {
    const operator = bundle.operators.find((item) => item.id === review.operatorId);
    const pilgrim = bundle.pilgrims.find((item) => item.id === review.pilgrimId);
    return {
      amount: fallbackComplaints[index]?.amount ?? "1 250 000 ₸",
      createdAt: formatShortDate(review.createdAt),
      operator: operator?.companyName ?? fallbackComplaints[index]?.operator ?? "Оператор",
      pilgrim: pilgrim?.fullName ?? fallbackComplaints[index]?.pilgrim ?? "Паломник",
      reason: review.comment || fallbackComplaints[index]?.reason || "Требуется проверка отзыва",
      status: fallbackComplaints[index]?.status ?? "В работе",
      tone: index === lowReviews.length - 1 ? "danger" : "warning",
    };
  });
}

export function buildAdminAnalytics(bundle: AdminBundleLike) {
  const totalRevenue = bundle.payments.reduce((sum, payment) => sum + payment.paidAmount, 0);
  const averageRating = bundle.reviews.length
    ? bundle.reviews.reduce((sum, review) => sum + review.rating, 0) / bundle.reviews.length
    : 4.72;

  return {
    averageRating,
    complaints: buildAdminComplaints(bundle),
    mrr: Math.max(8420000, Math.round(totalRevenue * 0.018)),
    operatorsCount: Math.max(bundle.operators.length, 47),
    pilgrimsCount: Math.max(bundle.pilgrims.length, 12840),
    seasons: [
      { label: "2024", value: 7480, width: 58 },
      { label: "2025", value: 10120, width: 78 },
      { label: "2026", value: Math.max(bundle.pilgrims.length, 12840), width: 100 },
    ],
    successfulFlightsPercent: "99.2%",
    topOperators: buildAdminTopOperators(bundle),
    totalRevenue,
  };
}

export const hotelReadinessChecks = [
  "✓ Название и категория",
  "✓ Адрес и координаты",
  "✓ Минимум 4 фото (7/12)",
  "✓ Минимум 2 типа номера (3)",
  "○ Услуги и удобства",
  "○ Условия аннуляции",
  "○ Контакты менеджера",
  "○ Сертификат Халяль (опц.)",
] as const;

export const hotelRooms = [
  {
    active: "24 места · активно",
    description: "2 односпальные кровати · 28 м² · панорамное окно · вид на город",
    perBed: "68 000 ₸",
    perPackage: "952 000 ₸",
    perRoom: "136 000 ₸",
    title: "Standard Double",
    tone: "emerald",
  },
  {
    active: "12 мест · премиум",
    description: "King size · 36 м² · прямой вид на Масджид аль-Харам · молитвенный коврик · Коран",
    perBed: "148 000 ₸",
    perPackage: "2 072 000 ₸",
    perRoom: "296 000 ₸",
    title: "Deluxe · вид на Каабу",
    tone: "success",
  },
  {
    active: "8 мест · family",
    description: "4 кровати · 62 м² · гостиная · кухня-ниша · подходит для семей с махрамом",
    perBed: "92 000 ₸",
    perPackage: "1 288 000 ₸",
    perRoom: "368 000 ₸",
    title: "Family Suite",
    tone: "default",
  },
] as const;

export const adminProfilePermissions = [
  ["Операторы", ["создавать", "редактировать", "блокировать", "удалять"]],
  ["Каталог отелей", ["все 4 права"]],
  ["Модерация контента", ["все 4 права"]],
  ["Биллинг и тарифы", ["все 4 права"]],
  ["API и интеграции", ["все 4 права"]],
  ["База данных · прямой доступ", ["требует MFA", "только для Super Admin"]],
  ["Пользовательские данные паломников", ["read-only · с обоснованием"]],
  ["Финансовые данные операторов", ["read-only · логируется"]],
] as const;

export const adminProfileSessions = [
  {
    badge: "текущая",
    badgeTone: "success",
    icon: "◉",
    meta: "Алматы, Казахстан · 10.0.4.18 · активен сейчас",
    title: "MacBook Pro · Chrome 124",
  },
  {
    action: "завершить",
    icon: "▣",
    meta: "Алматы · мобильная сеть · последняя активность 2 часа назад",
    title: "iPhone 15 · Safari 17",
  },
  {
    badge: "HW-токен",
    badgeTone: "default",
    icon: "◈",
    meta: "Физический ключ · последнее использование сегодня 09:12",
    title: "Yubikey 5C NFC",
  },
] as const;

export const adminProfileAudit = [
  ["14:32:18", "auth.login", "сессия · 2FA Yubikey", "10.0.4.18", "ok"],
  ["14:31:02", "hotel.create", "Mövenpick Hajar Tower", "10.0.4.18", "ok"],
  ["13:48:44", "operator.block", "Al-Nur Tour · подозрение на фишинг", "10.0.4.18", "warn"],
  ["13:12:07", "rate.update", "USD/KZT · 512.4", "10.0.4.18", "ok"],
  ["12:05:30", "user.read", "пользователь HJ-2026-018 · с обоснованием", "10.0.4.18", "ok"],
  ["11:22:14", "billing.invoice", "Al-Safa Travel · апрель", "10.0.4.18", "ok"],
  ["10:48:55", "api.key.rotate", "production key · scheduled", "10.0.4.18", "ok"],
  ["09:15:02", "auth.login", "iPhone · push-уведомление", "37.99.202.44", "ok"],
  ["08:01:12", "moderation.approve", "Hotel Dar Al Tawhid · фотогалерея", "10.0.4.18", "ok"],
  ["вчера", "system.backup", "ежедневный снэпшот · 4.2 ГБ", "system", "ok"],
] as const;

export const adminApiKeys = [
  ["Production", "sk_live_A7kP…2mQ3"],
  ["Staging", "sk_test_3xRt…kL8w"],
  ["CLI · личный", "sk_cli_9pQm…7wFt"],
] as const;

export const adminDangerLinks = [
  "Выйти на всех устройствах →",
  "Отозвать все API-ключи →",
  "Запросить экспорт аудита →",
  "Передать Super Admin →",
] as const;

export const exportEntities = [
  ["Паломники", "все поля · документы · статусы", "2 184 записи", true],
  ["Платежи и договоры", "суммы, способы оплаты, рассрочка", "3 472 операции", true],
  ["Группы и туры", "даты, отели, авиарейсы", "48 групп", true],
  ["Операторы", "активность, конверсия, выручка", "47 компаний", false],
  ["Документы и сканы", "ZIP с PDF · паспорта, прививки", "18 402 файла · 24 ГБ", false],
  ["Аудит-лог", "все действия в системе", "84 128 событий", false],
] as const;

export const exportMonths = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"] as const;

export const exportQuickRanges = [
  "Вчера",
  "Последние 7 дней",
  "Последние 30 дней",
  "Последние 90 дней",
  "Квартал",
  "С начала года",
  "С прошлого хаджа",
] as const;

export const exportHeatLevels = [
  1, 2, 1, 0, 0, 3, 2,
  2, 3, 1, 0, 4, 2, 1,
  1, 0, 2, 3, 1, 2, 1,
  3, 2, 4, 1, 0, 1, 2,
  2, 4, 3, 2, 1, 0, 0,
  1, 1, 2, 4, 3, 2, 1,
  0, 2, 1, 3, 2, 2, 1,
  1, 2, 3, 2, 1, 4, 3,
  3, 2, 1, 2, 3, 2, 1,
  2, 1, 3, 4, 2, 1, 0,
  0, 1, 2, 2, 3, 2, 2,
  1, 3, 2, 1, 2, 1, 1,
  4, 3, 2, 3, 4, 2, 1,
  2, 1, 0, 2, 3, 3, 2,
  1, 2, 1, 4, 3, 2, 0,
  3, 2, 1, 0, 0, 0, 0,
] as const;

export const exportFormats = [
  [".xlsx", "Excel · XLSX", "с формулами, сводной таблицей, форматированием", true],
  [".csv", "CSV · UTF-8", "универсальный, для импорта в другие системы", false],
  [".json", "JSON", "структурированный, для API и скриптов", false],
  [".pdf", "PDF-отчёт", "презентационный, с графиками и печатью", false],
] as const;

export const exportDelivery = [
  ["⤓", "Скачать сейчас", "ссылка живёт 24 часа, затем удаляется", true],
  ["@", "Email", "alikhan@hajjcrm.kz · с защищённой ссылкой", false],
  ["⟳", "Расписание", "каждую неделю / месяц / квартал автоматически", false],
  ["↗", "S3 / API", "для интеграции с 1С или BI-системой", false],
] as const;

export const exportHistory = [
  ["20.04.2026", "14:32", "Год · 2025", "Паломники, Платежи", "XLSX", "12.8 МБ", "АД · Super Admin", "скачать ↓", false],
  ["18.04.2026", "09:12", "Месяц · март 2026", "Все сущности", "ZIP", "248 МБ", "АД · Super Admin", "скачать ↓", false],
  ["15.04.2026", "18:44", "Неделя · 14 (07–13 апр)", "Операторы, Платежи", "CSV", "2.1 МБ", "АД · Super Admin", "скачать ↓", false],
  ["01.04.2026", "00:00", "Квартал · Q1 2026", "Паломники, Группы", "XLSX", "34.2 МБ", "⟳ авто · расписание", "скачать ↓", false],
  ["20.03.2026", "11:20", "Своё · 01.01 — 19.03", "Паломники", "PDF", "4.8 МБ", "АД · Super Admin", "истёк", true],
] as const;

export const exportSummaryRows = [
  ["Сущностей", "2"],
  ["Ожидаемых строк", "5 656"],
  ["Маскирование", "вкл · ИИН/паспорт"],
  ["Шифрование", "AES-256"],
] as const;
