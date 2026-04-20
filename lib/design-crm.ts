import type {
  DocumentRecord,
  GroupRecord,
  NotificationRecord,
  Operator,
  PaymentRecord,
  PilgrimProfile,
  PilgrimReadiness,
} from "@/types/domain";
import { formatDate, formatKzt, formatPercent, initials, maskIin } from "@/lib/format";
import { slugify } from "@/lib/utils";

export interface CrmBundleLike {
  documents: DocumentRecord[];
  groupLinks: Array<{ groupId: string; pilgrimId: string }>;
  groups: GroupRecord[];
  notifications: NotificationRecord[];
  operator: Operator;
  payments: PaymentRecord[];
  pilgrims: PilgrimProfile[];
  readiness: PilgrimReadiness[];
}

export interface CrmPilgrimRow {
  activity: string;
  avatarTone: string;
  docsCount: number;
  fullName: string;
  group: GroupRecord | null;
  groupName: string;
  id: string;
  initials: string;
  iin: string;
  payment: PaymentRecord | null;
  paymentPercent: number;
  phone: string;
  pilgrim: PilgrimProfile;
  readiness: PilgrimReadiness;
}

export interface ContractRow {
  contractLabel: string;
  openedLabel: string;
  payment: PaymentRecord;
  pilgrim: PilgrimProfile;
  qrCode: string;
  statusLabel: string;
  statusTone: "danger" | "muted" | "success" | "warning";
  groupName: string;
}

export interface GroupMemberRow {
  payment: PaymentRecord | null;
  pilgrim: PilgrimProfile;
  readiness: PilgrimReadiness;
}

export interface ManagerFeedback {
  id: string;
  initials: string;
  name: string;
  season: string;
  text: string;
}

export interface SyncLogLike {
  errors?: unknown;
  id: string;
  rows_created: number;
  rows_skipped: number;
  rows_updated: number;
  sheet_id: string;
  sheet_name: string | null;
  synced_at: string;
}

export function getPilgrimRouteId(pilgrim: Pick<PilgrimProfile, "fullName" | "id">) {
  return slugify(pilgrim.fullName) || pilgrim.id;
}

export function getPilgrimStatusLabel(status: PilgrimProfile["status"]) {
  const labels: Record<PilgrimProfile["status"], string> = {
    departed: "Улетели",
    docs_complete: "Документы",
    docs_pending: "Нет документов",
    new: "Новые",
    payment_partial: "Долг",
    payment_pending: "Долг",
    ready: "Готовы",
  };

  return labels[status];
}

function formatRelativeTime(value: string) {
  const target = new Date(value).getTime();
  const diffMs = target - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);
  const formatter = new Intl.RelativeTimeFormat("ru-RU", { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  return formatter.format(diffDays, "day");
}

export function getProgressTone(value: number) {
  if (value >= 90) {
    return "em";
  }

  if (value >= 60) {
    return "warn";
  }

  return "danger";
}

export function getStatusTone(value: number) {
  if (value >= 90) {
    return "success";
  }

  if (value >= 60) {
    return "warning";
  }

  return "danger";
}

export function getPaymentStatusMeta(status: PaymentRecord["status"]) {
  if (status === "paid") {
    return { label: "Оплачено", tone: "success" as const };
  }

  if (status === "partial") {
    return { label: "Частично", tone: "warning" as const };
  }

  return { label: "Ожидает", tone: "muted" as const };
}

export function getPaymentMethodLabel(method: PaymentRecord["paymentMethod"]) {
  const labels: Record<PaymentRecord["paymentMethod"], string> = {
    cash: "Наличные",
    halyk: "Halyk",
    kaspi: "Kaspi",
    transfer: "Перевод",
  };

  return labels[method];
}

export function getNotificationStatusMeta(status: NotificationRecord["status"]) {
  if (status === "sent") {
    return { label: "Отправлено", tone: "success" as const };
  }

  if (status === "failed") {
    return { label: "Ошибка", tone: "danger" as const };
  }

  return { label: "В очереди", tone: "warning" as const };
}

export function getNotificationTypeLabel(type: NotificationRecord["type"]) {
  const labels: Record<NotificationRecord["type"], string> = {
    checklist: "Чек-лист",
    reminder_docs: "Документы",
    reminder_flight: "Перед вылетом",
    reminder_payment: "Оплата",
    welcome: "Welcome",
  };

  return labels[type];
}

export function getNotificationChannelLabel(channel: NotificationRecord["channel"]) {
  const labels: Record<NotificationRecord["channel"], string> = {
    email: "Email",
    in_app: "In-app",
    sms: "SMS",
    whatsapp: "WhatsApp",
  };

  return labels[channel];
}

export function getDocumentTypeLabel(type: DocumentRecord["type"]) {
  const labels: Record<DocumentRecord["type"], string> = {
    medical_certificate: "Мед. справка",
    passport: "Паспорт",
    photo: "Фото",
    questionnaire: "Анкета",
    vaccination: "Вакцинация",
  };

  return labels[type];
}

export function buildCrmPilgrimRows(bundle: CrmBundleLike): CrmPilgrimRow[] {
  const readinessMap = new Map(bundle.readiness.map((item) => [item.pilgrimId, item]));
  const paymentMap = new Map(bundle.payments.map((item) => [item.pilgrimId, item]));
  const groupMap = new Map(bundle.groups.map((item) => [item.id, item]));
  const latestNotificationByPilgrim = new Map<string, NotificationRecord>();

  bundle.notifications.forEach((notification) => {
    if (!latestNotificationByPilgrim.has(notification.pilgrimId)) {
      latestNotificationByPilgrim.set(notification.pilgrimId, notification);
    }
  });

  return bundle.pilgrims.map((pilgrim, index) => {
    const readiness = readinessMap.get(pilgrim.id) ?? {
      docsCount: 0,
      isInGroup: false,
      isPaymentComplete: false,
      isReady: false,
      pilgrimId: pilgrim.id,
      readinessPercent: 0,
    };
    const payment = paymentMap.get(pilgrim.id) ?? null;
    const group =
      groupMap.get(bundle.groupLinks.find((link) => link.pilgrimId === pilgrim.id)?.groupId ?? "") ?? null;
    const latestNotification = latestNotificationByPilgrim.get(pilgrim.id);
    const paymentPercent = payment && payment.totalAmount > 0 ? Math.round((payment.paidAmount / payment.totalAmount) * 100) : 0;
    const avatarPalette = [
      "var(--emerald)",
      "var(--gold-deep)",
      "#3a3a3a",
      "var(--ink)",
      "#6b8a70",
    ];

    return {
      activity: latestNotification ? formatRelativeTime(latestNotification.scheduledAt) : formatRelativeTime(pilgrim.createdAt),
      avatarTone: avatarPalette[index % avatarPalette.length],
      docsCount: readiness.docsCount,
      fullName: pilgrim.fullName,
      group,
      groupName: group?.name ?? "Не назначен",
      id: pilgrim.id,
      initials: initials(pilgrim.fullName),
      iin: maskIin(pilgrim.iin),
      payment,
      paymentPercent,
      phone: pilgrim.phone,
      pilgrim,
      readiness,
    };
  });
}

export function buildGroupMembers(bundle: CrmBundleLike, groupId: string): GroupMemberRow[] {
  const pilgrimsById = new Map(bundle.pilgrims.map((item) => [item.id, item]));
  const readinessById = new Map(bundle.readiness.map((item) => [item.pilgrimId, item]));
  const paymentsById = new Map(bundle.payments.map((item) => [item.pilgrimId, item]));

  return bundle.groupLinks
    .filter((link) => link.groupId === groupId)
    .map((link) => ({
      payment: paymentsById.get(link.pilgrimId) ?? null,
      pilgrim: pilgrimsById.get(link.pilgrimId),
      readiness: readinessById.get(link.pilgrimId),
    }))
    .filter(
      (
        item,
      ): item is {
        payment: PaymentRecord | null;
        pilgrim: PilgrimProfile;
        readiness: PilgrimReadiness;
      } => Boolean(item.pilgrim && item.readiness),
    );
}

export function buildMonthlyPaymentChart(payments: PaymentRecord[]) {
  const fallback = [
    { darkHeight: 30, emeraldHeight: 18, label: "Май", value: 18_400_000 },
    { darkHeight: 42, emeraldHeight: 24, label: "Июн", value: 24_200_000 },
    { darkHeight: 48, emeraldHeight: 28, label: "Июл", value: 27_100_000 },
    { darkHeight: 54, emeraldHeight: 32, label: "Авг", value: 31_800_000 },
    { darkHeight: 60, emeraldHeight: 36, label: "Сен", value: 36_500_000 },
    { darkHeight: 65, emeraldHeight: 39, label: "Окт", value: 40_200_000 },
    { darkHeight: 72, emeraldHeight: 43, label: "Ноя", value: 45_800_000 },
    { darkHeight: 80, emeraldHeight: 48, label: "Дек", value: 52_400_000 },
    { darkHeight: 88, emeraldHeight: 54, label: "Янв", value: 61_200_000 },
    { darkHeight: 92, emeraldHeight: 60, label: "Фев", value: 69_500_000 },
    { darkHeight: 96, emeraldHeight: 66, label: "Мар", value: 82_600_000 },
    { darkHeight: 100, emeraldHeight: 72, label: "Апр", value: 98_400_000 },
  ];
  const map = new Map<string, { amount: number; label: string; partial: number }>();

  payments.forEach((payment) => {
    const key = payment.createdAt.slice(0, 7);
    const current = map.get(key) ?? {
      amount: 0,
      label: new Intl.DateTimeFormat("ru-RU", { month: "short" }).format(new Date(payment.createdAt)),
      partial: 0,
    };

    current.amount += payment.paidAmount;
    current.partial += payment.status === "partial" ? payment.paidAmount : 0;
    map.set(key, current);
  });

  const items = Array.from(map.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, value]) => value);
  const max = Math.max(1, ...items.map((item) => item.amount || item.partial));

  const rows = items.map((item) => ({
    darkHeight: Math.max(12, Math.round((item.amount / max) * 100)),
    emeraldHeight: Math.max(10, Math.round((Math.max(item.partial, item.amount * 0.64) / max) * 100)),
    label: item.label.replace(".", ""),
    value: item.amount,
  }));

  return rows.length >= 12 ? rows.slice(-12) : fallback;
}

export function buildContracts(bundle: CrmBundleLike): ContractRow[] {
  const groupById = new Map(bundle.groups.map((item) => [item.id, item]));
  const pilgrimById = new Map(bundle.pilgrims.map((item) => [item.id, item]));

  return bundle.payments
    .map((payment, index): ContractRow | null => {
      const pilgrim = pilgrimById.get(payment.pilgrimId);
      if (!pilgrim) {
        return null;
      }

      const groupId = bundle.groupLinks.find((link) => link.pilgrimId === payment.pilgrimId)?.groupId;
      const group = groupId ? groupById.get(groupId) : null;
      const number = String(index + 18).padStart(3, "0");
      const { label, tone } = getPaymentStatusMeta(payment.status);
      const statusTone: ContractRow["statusTone"] = payment.contractUrl
        ? payment.status === "paid"
          ? "success"
          : payment.status === "partial"
            ? "warning"
            : tone
        : "muted";

      return {
        contractLabel: `KZ-HJ-2026-${number}`,
        groupName: group ? `${group.name}` : "Без группы",
        openedLabel: payment.contractGeneratedAt ? formatDate(payment.contractGeneratedAt) : "—",
        payment,
        pilgrim,
        qrCode: payment.qrCode ?? `QR-HJ-2026-${initials(pilgrim.fullName)}-${number}`,
        statusLabel: payment.contractUrl ? (payment.status === "paid" ? "Подписан" : payment.status === "partial" ? "Ждёт подписи" : "Черновик") : "Черновик",
        statusTone,
      };
    })
    .filter((item): item is ContractRow => item !== null);
}

export const dashboardAlerts = [
  { initials: "АК", message: "отклонена справка 086/у", name: "Асхат Кенесов", percent: 64 },
  { initials: "ЖС", message: "не ответила на 3 напоминания", name: "Жанна Сарсенова", percent: 68 },
];

export const sheetsMappingRows = [
  { crmField: "pilgrim.full_name", header: "ФИО", status: "Распознано", tone: "success" },
  { crmField: "pilgrim.phone", header: "Телефон", status: "Распознано", tone: "success" },
  { crmField: "pilgrim.iin", header: "ИИН", status: "Распознано", tone: "success" },
  { crmField: "contract.amount_kzt", header: "Сумма", status: "Распознано", tone: "success" },
  { crmField: "payment.status", header: "Статус оплаты", status: "Распознано", tone: "success" },
  { crmField: "pilgrim.status", header: "Статус паломника", status: "Распознано", tone: "success" },
  { crmField: "group.name", header: "Группа", status: "Распознано", tone: "success" },
  { crmField: "group.flight_date", header: "Дата вылета", status: "Распознано", tone: "success" },
  { crmField: "— нет соответствия", header: "Комментарий менеджера", status: "Не распознано", tone: "danger" },
];

export const whatsappScenarios = [
  {
    detail:
      "Отправляется паломнику за 3 дня до дедлайна платежа. Вариативный текст с суммой, номером договора и Kaspi-ссылкой.",
    meta: ["Отправлено · 142", "Прочитано · 138 (97%)", "Оплат после · 89 (63%)"],
    status: "Активен",
    title: "Напоминание о платеже · за 3 дня",
    tone: "success",
  },
  {
    detail: "Приветствие + ссылка на личный кабинет + PDF со списком из 5 документов. Отправляется через 5 минут после регистрации.",
    meta: ["Отправлено · 47", "CTR в кабинет · 94%", "Документов загружено · 41"],
    status: "Активен",
    title: "Welcome + чек-лист документов",
    tone: "success",
  },
  {
    detail:
      "Напоминание о прививке с адресами 3 ближайших пунктов вакцинации по городу паломника. Триггер: departure_in_days === 14.",
    meta: ["Отправлено · 38", "Прочитано · 36", "Загрузили сертификат · 31"],
    status: "Активен",
    title: "ACWY-прививка · напоминание за 14 дней",
    tone: "success",
  },
  {
    detail: "PDF посадочного + маршрут в аэропорт + точки встречи группы. Отправляется всей группе одновременно.",
    meta: ["Шаблон · утверждён Meta", "Доставка · 100%"],
    status: "Активен",
    title: "Бордингпасс · за 24 часа до вылета",
    tone: "success",
  },
  {
    detail: "LLM-бот на базе 156 вопросов из FAQ. Передаёт куратору, если не уверен. За апрель — 847 автоответов.",
    meta: ["Точность · 84%", "Передано куратору · 27%"],
    status: "Обучается",
    title: "FAQ-бот · автоответы",
    tone: "warning",
  },
  {
    detail: "Отправка памятки перед вылетом: аэропорт, номер рейса, гейт сбора, вес багажа и контакт куратора.",
    meta: ["Отправлено · 46", "Прочитано · 45", "Ответили · 31"],
    status: "Активен",
    title: "Перед вылетом · группа и аэропорт",
    tone: "success",
  },
];

export const reportHistory = [
  { format: "Excel · 14 листов", name: "Финансовый отчёт · апрель 2026", period: "01.04 — 30.04", size: "487 КБ" },
  { format: "PDF · 18 стр", name: "Реестр паломников · Группа A", period: "активная", size: "1.2 МБ" },
  { format: "Excel + PDF", name: "Налоговая отчётность · 1 квартал", period: "01.01 — 31.03", size: "2.8 МБ" },
  { format: "PDF · 42 стр", name: "Отчёт для МДА · подписание хадж-2026", period: "всё время", size: "4.1 МБ" },
  { format: "ZIP · 47 PDF", name: "Экспорт договоров · KZ-HJ-2026 серия", period: "01.01 — 30.04", size: "68.4 МБ" },
  { format: "CSV · UTF-8", name: "Статистика WA-рассылок · апрель", period: "01.04 — 30.04", size: "96 КБ" },
];

export const companyLicenses = [
  { body: "Духовное управление мусульман Казахстана", label: "Лицензия №047", meta: "Действует до 31.12.2027", title: "МДА РК" },
  { body: "Ministry of Hajj & Umrah, Saudi Arabia", label: "IATA 47-3-09821", meta: "Аккредитован · сезон 1446", title: "MOHU KSA" },
  { body: "Туроператорская деятельность", label: "KZ-TOUR-2014", meta: "Бессрочная", title: "Лицензия РК" },
];

export const companyTeam = [
  { initials: "БТ", name: "Бауыржан Темирханов", role: "Старший куратор · 12 лет", tone: "var(--ink)" },
  { initials: "АС", name: "Айгерим С.", role: "Гл. менеджер", tone: "var(--emerald)" },
  { initials: "НК", name: "Нұргүл К.", role: "Куратор A · Б", tone: "var(--gold-deep)" },
  { initials: "МО", name: "Марат О.", role: "Муфтий-гид", tone: "var(--ink-soft)" },
  { initials: "ДА", name: "Данияр А.", role: "Визы · документы", tone: "#6b8a70" },
  { initials: "ЛТ", name: "Ләйлә Т.", role: "Бухгалтер", tone: "var(--emerald)" },
];

export const settingsIntegrations = [
  { code: "KP", description: "Автоматический приём платежей + рассрочка 0%. 847 транзакций · апрель.", name: "Kaspi Pay · Red Installment", status: "Активно", tone: "success" },
  { code: "HB", description: "Сверка банковских переводов по ИИК. Синхронизация каждые 15 минут.", name: "Halyk Bank · IIK", status: "Активно", tone: "success" },
  { code: "WA", description: "Meta Cloud API · шаблоны утверждены. 1 284 диалогов · апрель.", name: "WhatsApp Business API", status: "Активно", tone: "success" },
  { code: "GS", description: "Двусторонняя синхронизация реестра паломников. 4 листа.", name: "Google Sheets", status: "Активно", tone: "success" },
  { code: "1С", description: "Выгрузка платёжных документов и актов. Последняя синхронизация · 14:20.", name: "1С:Бухгалтерия для Казахстана", status: "Активно", tone: "success" },
  { code: "MDA", description: "API ещё не опубликован. Ожидаем к июню.", name: "Портал МДА · Хадж-2026", status: "Скоро", tone: "muted" },
];

export const importPreviewRows = [
  { action: "создать", actionTone: "success", amount: "2 850 000 ₸", group: "Рамазан-2026", iin: "900815500123", name: "Ерлан Мухаметов", row: "01", state: "partial", stateTone: "warning", type: "new" },
  { action: "создать", actionTone: "success", amount: "3 100 000 ₸", group: "Астана-Премиум", iin: "890412400445", name: "Айгүл Нұрқожаева", row: "02", state: "готов", stateTone: "success", type: "new" },
  { action: "обновить", actionTone: "emerald", amount: "2 950 000 ₸", group: "Рамазан-2026", iin: "820708300210", name: "Марат Оспанов", row: "03", state: "нет доков", stateTone: "muted", type: "upd" },
  { action: "создать", actionTone: "success", amount: "2 720 000 ₸", group: "Рамазан-2026", iin: "810903300114", name: "Қуанышбек Сапаров", row: "04", state: "новый", stateTone: "success", type: "new" },
  { action: "создать", actionTone: "success", amount: "3 240 000 ₸", group: "Астана-Премиум", iin: "920405400198", name: "Мадина Есимова", row: "05", state: "partial", stateTone: "warning", type: "new" },
  { action: "создать", actionTone: "success", amount: "2 980 000 ₸", group: "Медина-Первая", iin: "780612300455", name: "Ермек Калиев", row: "06", state: "готов", stateTone: "success", type: "new" },
  { action: "обновить", actionTone: "emerald", amount: "2 660 000 ₸", group: "Рамазан-2026", iin: "860224400502", name: "Зарина Тұрсын", row: "07", state: "частично", stateTone: "warning", type: "upd" },
  { action: "создать", actionTone: "success", amount: "2 850 000 ₸", group: "Рамазан-2026", iin: "870311300801", name: "Дәурен Мұқанов", row: "08", state: "новый", stateTone: "success", type: "new" },
  { action: "Исправить →", actionTone: "danger", amount: "2 850 000 ₸", group: "Рамазан-2026", iin: "90081•••", name: "Кенжебеков Нұрбол", row: "34", state: "частично", stateTone: "warning", type: "err" },
];

export const managerFeedback: ManagerFeedback[] = [
  {
    id: "feedback-1",
    initials: "АД",
    name: "Алтынай Д.",
    season: "Хадж 1445 · июль 2024",
    text: "Бауыржан всегда на связи. Помог с документами, когда у меня был сложный случай с ИИН. Спокойный, грамотный.",
  },
  {
    id: "feedback-2",
    initials: "МО",
    name: "Марат О.",
    season: "Умра 1446 · март 2025",
    text: "Было много вопросов, он всё разложил по полочкам. После возвращения даже позвонил и спросил впечатления.",
  },
];

export const managerSchedule = [
  { day: "Сегодня", events: [{ label: "Групповой Zoom · Группа A", time: "10:00", type: "default" }, { label: "Сдача документов в МДА", time: "13:00", type: "urgent" }, { label: "Встреча с новыми паломниками", time: "15:30", type: "default" }], note: "20 апр", today: true },
  { day: "Вт", events: [{ label: "Консультация · 5 паломников", time: "11:00", type: "default" }], note: "21 апр" },
  { day: "Ср", events: [{ label: "Звонок в Saudia · бронь", time: "09:00", type: "default" }, { label: "Инструктаж по обрядам", time: "14:00", type: "default" }], note: "22 апр" },
  { day: "Чт", events: [], note: "23 апр" },
  { day: "Пт", events: [{ label: "Жума · офис закрыт", time: "12:30", type: "friday" }], note: "24 апр" },
  { day: "Сб", events: [], note: "25 апр", weekend: true },
  { day: "Вс", events: [], note: "26 апр", weekend: true },
];

export function getSheetsHistoryRows(logs: SyncLogLike[]) {
  return logs.map((log) => ({
    created: log.rows_created,
    date: `${new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(log.synced_at))}`.replace(",", " ·"),
    hasErrors: Array.isArray(log.errors) ? log.errors.length > 0 : false,
    skipped: log.rows_skipped,
    updated: log.rows_updated,
  }));
}

export function getCompanyHeroStats(bundle: CrmBundleLike) {
  const ready = bundle.readiness.filter((item) => item.isReady).length;
  const quota = bundle.groups.reduce((sum, item) => sum + item.quotaTotal, 0);
  const filled = bundle.groups.reduce((sum, item) => sum + item.quotaFilled, 0);

  return [
    { detail: `активных паломников`, label: "Хадж 1446 · план", value: String(bundle.pilgrims.length) },
    { detail: bundle.groups.map((group, index) => String.fromCharCode(65 + index)).join(" · "), label: "Групп на сезон", value: String(bundle.groups.length) },
    { detail: `мест · осталось ${Math.max(quota - filled, 0)}`, label: "Квота МДА", value: String(quota || 65) },
    { detail: `${ready} готовы к вылету`, label: "Готовность базы", value: formatPercent((ready / Math.max(bundle.pilgrims.length, 1)) * 100) },
  ];
}

export function getDashboardList(bundle: CrmBundleLike) {
  return buildCrmPilgrimRows(bundle)
    .sort((left, right) => right.readiness.readinessPercent - left.readiness.readinessPercent)
    .slice(0, 5);
}

export function getDashboardAlerts(bundle: CrmBundleLike) {
  const liveAlerts = buildCrmPilgrimRows(bundle)
    .filter((item) => item.readiness.readinessPercent < 90)
    .sort((left, right) => left.readiness.readinessPercent - right.readiness.readinessPercent)
    .slice(0, 3)
    .map((item) => ({
      initials: item.initials,
      message:
        item.payment?.status === "pending"
          ? `остаток ${formatKzt((item.payment?.totalAmount ?? 0) - (item.payment?.paidAmount ?? 0))}`
          : item.docsCount < 5
            ? `не загружено ${5 - item.docsCount} документов`
            : "нужно проверить готовность",
      name: item.fullName,
      percent: item.readiness.readinessPercent,
    }));

  return [...liveAlerts, ...dashboardAlerts].slice(0, 5);
}

export function getGroupRevenue(bundle: CrmBundleLike, groupId: string) {
  const pilgrimIds = bundle.groupLinks.filter((link) => link.groupId === groupId).map((link) => link.pilgrimId);
  return bundle.payments.filter((payment) => pilgrimIds.includes(payment.pilgrimId)).reduce((sum, payment) => sum + payment.paidAmount, 0);
}
