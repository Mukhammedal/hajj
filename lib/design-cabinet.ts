import { DOCUMENT_META } from "@/lib/documents";
import { formatDate, formatKzt, initials, maskIin } from "@/lib/format";
import type { ChecklistCategory, ChecklistItem, DocumentRecord, GroupRecord, NotificationRecord, PaymentRecord, PilgrimProfile } from "@/types/domain";

export interface GroupMemberCard {
  cityMeta: string;
  initials: string;
  isGuide?: boolean;
  isSelf?: boolean;
  name: string;
  readiness: number | null;
  tone?: "default" | "emerald" | "gold" | "warning";
}

export interface TimelineStep {
  dateLabel: string;
  detail: string;
  status?: "done" | "now" | "upcoming";
  title: string;
}

export interface ChatThread {
  id: string;
  initials: string;
  name: string;
  preview: string;
  time: string;
  tone?: "default" | "gold" | "ink";
  unread?: number;
}

export interface ChatMessage {
  body?: string;
  detail?: string;
  direction: "in" | "out";
  hotelImage?: string;
  hotelLink?: string;
  hotelTitle?: string;
  time: string;
  type?: "hotel-card";
}

export interface FaqQuestion {
  answer?: string[];
  helpful?: string;
  question: string;
  updated?: string;
}

export interface FaqSection {
  count: number;
  questions: FaqQuestion[];
  title: string;
}

const checklistLabels: Record<ChecklistCategory, string> = {
  documents: "Документы",
  health: "Здоровье",
  clothing: "Одежда",
  finance: "Финансы",
  spiritual: "Духовное",
};

export function getChecklistLabel(category: ChecklistCategory) {
  return checklistLabels[category];
}

export function formatShortDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function getDaysUntilFlight(flightDate: string) {
  const target = new Date(flightDate);
  const today = new Date();
  const midnightTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const midnightToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  return Math.max(Math.round((midnightTarget - midnightToday) / (1000 * 60 * 60 * 24)), 0);
}

export function mapPaymentMethodLabel(method: PaymentRecord["paymentMethod"]) {
  const labels: Record<PaymentRecord["paymentMethod"], string> = {
    cash: "Наличные",
    halyk: "Halyk",
    kaspi: "Kaspi",
    transfer: "Банковский перевод",
  };

  return labels[method];
}

export function mapNotificationTone(status: NotificationRecord["status"]) {
  if (status === "failed") {
    return "danger";
  }

  if (status === "queued") {
    return "warn";
  }

  return "ok";
}

export function buildDocumentRows(documents: DocumentRecord[]) {
  const latestByType = new Map(documents.map((document) => [document.type, document]));

  return DOCUMENT_META.map((meta) => {
    const document = latestByType.get(meta.type);

    return {
      detail: document
        ? `${document.fileName} · ${document.isVerified ? "принят куратором" : "на проверке"} · ${formatShortDate(document.uploadedAt)}`
        : `${meta.title.toUpperCase()} · не загружен`,
      document,
      title: `${meta.title} (${meta.type})`,
      type: meta.type,
    };
  });
}

export function buildGroupMembers(pilgrim: PilgrimProfile) {
  return [
    { cityMeta: "Куратор группы · Al-Safa", initials: "БТ", isGuide: true, name: "Бауыржан Темирханов", readiness: null, tone: "gold" },
    {
      cityMeta: `${pilgrim.phone ? pilgrim.phone : "Алматы"} · ${pilgrim.gender || "паломник"}`,
      initials: initials(pilgrim.fullName),
      isSelf: true,
      name: pilgrim.fullName,
      readiness: 87,
      tone: "emerald",
    },
    { cityMeta: "Астана · 56 лет", initials: "АН", name: "Айгүл Нұрқожаева", readiness: 92 },
    { cityMeta: "Шымкент · 71 год", initials: "МО", name: "Марат Оспанов", readiness: 64, tone: "warning" },
    { cityMeta: "Туркестан · 48 лет", initials: "ГС", name: "Гүлжан Серікбай", readiness: 88 },
    { cityMeta: "Алматы · 52 года", initials: "НА", name: "Нұрлан Әбдірахман", readiness: 95 },
    { cityMeta: "Астана · 39 лет", initials: "ДТ", name: "Динара Темірбаева", readiness: 83 },
    { cityMeta: "Шымкент · 61 год", initials: "РК", name: "Руслан Кенжебаев", readiness: 58, tone: "warning" },
  ] satisfies GroupMemberCard[];
}

export const groupTimeline: TimelineStep[] = [
  {
    dateLabel: "17 мар · Алматы",
    detail: "Терминал 2 · стойка регистрации Saudia · 11:00",
    status: "done",
    title: "Сбор в аэропорту",
  },
  {
    dateLabel: "18 мар · рейс SV 1794",
    detail: "Вылет 13:40 · прилёт 18:30 по местному · Airbus A330",
    status: "done",
    title: "Алматы → Джидда",
  },
  {
    dateLabel: "18 мар · 22:00",
    detail: "Номер Haram View · 14 этаж · трансфер от аэропорта 4 ч",
    status: "now",
    title: "Размещение · Hilton Suites Makkah",
  },
  {
    dateLabel: "19 мар · утро",
    detail: "С куратором Бауыржаном в 07:00 · вход King Abdul Aziz Gate",
    title: "Умра · первый таваф",
  },
  {
    dateLabel: "20–27 мар",
    detail: "Свободная программа с 4 групповыми занятиями по фикху хаджа",
    title: "Ибадат в Мекке",
  },
  {
    dateLabel: "28 мар",
    detail: "Автобус · 5 ч · с посещением мечети Куба",
    title: "Переезд в Медину",
  },
  {
    dateLabel: "29–31 мар",
    detail: "40 намазов в мечети Пророка · посещение исторических мест",
    title: "Медина · мечеть Пророка",
  },
  {
    dateLabel: "01 апр",
    detail: "Вылет 02:15 SV 1795 · прилёт в Алматы 11:30",
    title: "Возвращение · Медина → Алматы",
  },
];

export const groupDocuments = [
  "Программа пребывания · PDF",
  "Список контактов отеля · PDF",
  "Памятка для новичков · PDF",
  "Молитвы для хаджа · PDF",
];

export const groupSeats = ["14A", "14B · Вы", "14C · семья", "14D", "14E", "14F"];

export const chatThreads: ChatThread[] = [
  {
    id: "curator",
    initials: "БТ",
    name: "Бауыржан · куратор",
    preview: "Отель: выбрал для вас Haram View · 14 этаж",
    time: "14:27",
  },
  {
    id: "group",
    initials: "GR",
    name: "Группа A · Рамазан-2026",
    preview: "Айгүл: кто-нибудь уже сделал прививку?",
    time: "13:08",
    tone: "gold",
    unread: 2,
  },
  {
    id: "support",
    initials: "AS",
    name: "Al-Safa · поддержка",
    preview: "Ваш платёж подтверждён",
    time: "09.04",
    tone: "ink",
  },
  {
    id: "dumk",
    initials: "ДУ",
    name: "ДУМК · оповещения",
    preview: "Ваш QR-код активирован, паспорт верифицирован",
    time: "03.04",
    tone: "ink",
  },
  {
    id: "neighbor",
    initials: "РК",
    name: "Руслан К. · сосед по рейсу",
    preview: "Привет, тоже из Шымкента! Созвонимся перед вылетом?",
    time: "28.03",
  },
];

export function buildChatMessages(pilgrim: PilgrimProfile): ChatMessage[] {
  const firstName = pilgrim.fullName.split(" ")[1] || pilgrim.fullName.split(" ")[0] || "Ерлан";

  return [
    {
      body: `Ассаламу алейкум, Бауыржан-ага. У меня вопрос про ACWY-прививку. Где её можно сделать быстрее всего?`,
      direction: "out",
      time: "10:14",
    },
    {
      body: "Уа алейкум ассалам. Рекомендую центр «Интертич» на Абая 109 — по нашему направлению делают без очереди. Возьмите паспорт и скажите, что вы от Al-Safa.",
      direction: "in",
      time: "10:28",
    },
    {
      body: "Сертификат выдают сразу, он должен быть с печатью Минздрава + англоязычный перевод. Без этого в Джидде не пустят.",
      direction: "in",
      time: "10:29",
    },
    {
      body: "Понял, спасибо! Сегодня схожу. Ещё — отель. Я уже могу посмотреть конкретный номер?",
      direction: "out",
      time: "11:42",
    },
    {
      detail: "14 этаж, номер 1407 · вид на Каабу",
      direction: "in",
      hotelImage: "https://images.unsplash.com/photo-1587985064135-0366536eab42?auto=format&fit=crop&w=600&q=80",
      hotelLink: "/hotels/hilton-suites-makkah",
      hotelTitle: "Hilton Suites Makkah · Haram View",
      time: "14:26",
      type: "hotel-card",
    },
    {
      body: `Вот ваш номер, ${firstName}. Выбрал специально на верхнем этаже — оттуда видна Кааба, слышен адан. Заселение после перелёта вечером.`,
      direction: "in",
      time: "14:27",
    },
    {
      body: "Машаллах, это идеально. Барак Аллаху фика 🤲",
      direction: "out",
      time: "14:31",
    },
    {
      body: "Ва фика барак Аллах. Если ещё вопросы — пишите в любое время. Перед вылетом сделаем групповую встречу в Zoom.",
      direction: "in",
      time: "14:33",
    },
  ];
}

export const faqCategories = [
  { count: 42, label: "Документы и виза" },
  { count: 28, label: "Оплата и рассрочка" },
  { count: 19, label: "Прививки и здоровье" },
  { count: 24, label: "Что взять с собой" },
  { count: 16, label: "Отель и проживание" },
  { count: 15, label: "Обряды хаджа" },
  { count: 12, label: "Возврат и отмена" },
];

export const faqSections: FaqSection[] = [
  {
    count: 42,
    questions: [
      {
        answer: [
          "Минздрав Саудовской Аравии требует от всех паломников сертификат о прививке против менингококка серогрупп A, C, W, Y. Без неё вас не пустят в страну на границе в Джидде.",
          "Сделать нужно не позднее чем за 10 дней до вылета и не ранее чем за 3 года.",
          "В Алматы делают бесплатно в поликлиниках по полису и платно в «Интертиче», «Olymp Med», «OnClinic».",
          "Сертификат должен быть с печатью Минздрава РК и переводом на английский.",
          "Приложите скан в раздел «Документы» — мы автоматически проверим.",
        ],
        helpful: "👍 142 · 👎 3",
        question: "Что такое ACWY-прививка и почему она обязательна?",
        updated: "08.04.2026",
      },
      { question: "Как долго делается виза хаджа и что нужно для подачи?" },
      { question: "Что делать, если паспорт истекает раньше 6 месяцев после возвращения?" },
      { question: "Можно ли взять с собой Коран, чётки, ковёр в багаж?" },
      { question: "Нужна ли махрам для женщин моложе 45 лет?" },
    ],
    title: "Документы и виза",
  },
  {
    count: 28,
    questions: [
      {
        answer: [
          "Мы оформляем рассрочку прямо в офисе Al-Safa или онлайн через приложение Kaspi.kz. Одобрение обычно за 2–3 минуты.",
          "Первый взнос — от 30% для тура 2 850 000 ₸.",
          "Остаток делится на 18 ежемесячных платежей · без переплаты.",
          "Нужен только ИИН и лимит на Kaspi Red.",
          "Альтернативы: Halyk, Jusan, ForteBank — условия в разделе «Оплата».",
        ],
        helpful: "👍 98 · 👎 2",
        question: "Как оформить Kaspi Red 0% на 18 месяцев?",
        updated: "12.04.2026",
      },
      { question: "Что если я не смогу поехать — возвращают ли деньги?" },
      { question: "Можно ли оплатить за двоих одним переводом?" },
      { question: "Принимаете ли доллары или только тенге?" },
      { question: "Есть ли скидка для семейных пар или пенсионеров?" },
    ],
    title: "Оплата и рассрочка",
  },
  {
    count: 19,
    questions: [
      {
        answer: [
          "Минздрав КСА на хадж 1447 требует три обязательных прививки и одну рекомендованную.",
          "Менингит ACWY — обязательно, действует 3 года, за 10 дней до вылета.",
          "Жёлтая лихорадка — если летели через страны Африки или Южной Америки в последние 6 лет.",
          "Сезонный грипп — обязательно для паломников 65+ и с хроническими заболеваниями.",
          "COVID-19 booster — рекомендовано, свежая доза в течение 12 месяцев.",
        ],
        helpful: "👍 204 · 👎 1",
        question: "Какие прививки обязательны для хаджа в 1447 году?",
        updated: "14.04.2026",
      },
      { question: "Что делать при хронических заболеваниях — гипертония, диабет?" },
      { question: "Какая страховка нужна и что она покрывает в КСА?" },
      { question: "Можно ли взять с собой свои лекарства? Какие запрещены?" },
    ],
    title: "Прививки и здоровье",
  },
  {
    count: 24,
    questions: [
      {
        answer: [
          "Saudia Алматы–Джидда: 2 места по 23 кг в багаж + ручная кладь 7 кг.",
          "На обратный рейс норма та же, но замзам 5 л часто идёт в отдельной упаковке.",
          "Запрещено: алкоголь, свинина, некоторые БАДы с CBD, дроны, радиостанции.",
          "Обязательно: ихрам, удобная обувь без задника, сумка-пояс, термос, солнечные очки.",
        ],
        helpful: "👍 178 · 👎 4",
        question: "Какая норма багажа и что точно нельзя провозить?",
        updated: "11.04.2026",
      },
      { question: "Как правильно носить ихрам · пошагово с видео" },
      { question: "Сколько наличных денег брать и в какой валюте?" },
      { question: "Какой телефон и SIM-карта будут работать в Мекке?" },
    ],
    title: "Что взять с собой",
  },
  {
    count: 16,
    questions: [
      { question: "Насколько отель далеко от Харама и как туда добираться?" },
      { question: "Можно ли выбрать конкретный номер или этаж?" },
      { question: "Какое питание включено — завтрак, обед, ужин?" },
      { question: "Есть ли женский этаж и что это значит?" },
    ],
    title: "Отель и проживание",
  },
  {
    count: 15,
    questions: [
      {
        answer: [
          "Да, все обряды хаджа разрешены на коляске или с помощником. В Масджид аль-Харам и в Мина работают специальные дорожки для инвалидов.",
          "Коляску можно арендовать в Хараме или заранее через отель.",
          "Второй уровень матафа обычно менее людный.",
          "Куратор поможет организовать трансферы Careem и сопровождение.",
        ],
        helpful: "👍 87 · 👎 0",
        question: "Можно ли совершать обряды на коляске для пожилых?",
        updated: "03.04.2026",
      },
      { question: "В каком порядке совершаются обряды в дни хаджа?" },
      { question: "Что делать женщине если начались месячные?" },
      { question: "Как правильно побрить голову и где это сделать?" },
    ],
    title: "Обряды хаджа",
  },
  {
    count: 12,
    questions: [
      { question: "Полный возврат — до какой даты и в каких случаях?" },
      { question: "Что если заболел за 3 дня до вылета?" },
      { question: "Передаётся ли путёвка другому человеку?" },
      { question: "Что если Саудовская Аравия откажет в визе?" },
    ],
    title: "Возврат и отмена",
  },
];

export function buildProfileHeroMeta(pilgrim: PilgrimProfile, group: GroupRecord | null) {
  return {
    ageLabel: pilgrim.dateOfBirth ? `${calculateAge(pilgrim.dateOfBirth)} лет` : "возраст уточняется",
    countdown: group ? `до вылета ${getDaysUntilFlight(group.flightDate)} дней` : "даты ещё не назначены",
    groupLabel: group ? `${group.name}` : "группа не назначена",
    identifier: `HJ-${new Date().getFullYear()}-${pilgrim.id.slice(-3).toUpperCase()}`,
  };
}

export function buildProfileSummaryTags(documents: DocumentRecord[], payment: PaymentRecord | null, group: GroupRecord | null) {
  const docsCount = new Set(documents.map((document) => document.type)).size;
  const tags = [`Документы · ${docsCount} из 5`];

  if (payment) {
    const percent = payment.totalAmount > 0 ? Math.round((payment.paidAmount / payment.totalAmount) * 100) : 0;
    tags.push(`Платёж · ${percent}%`);
  }

  if (group) {
    tags.push(`Группа · ${group.name}`);
    tags.push(`Отель ${group.hotelMecca}`);
    tags.push(`Вылет ${formatDate(group.flightDate)}`);
  }

  return tags;
}

export function buildNotificationHistory(notifications: NotificationRecord[]) {
  return notifications.map((notification) => ({
    detail: notification.message,
    time: formatShortDate(notification.sentAt ?? notification.scheduledAt),
    title: notification.status === "sent" ? "Уведомление отправлено" : "Напоминание запланировано",
  }));
}

export function buildProfilePersonalRows(pilgrim: PilgrimProfile) {
  return [
    ["ФИО (кириллица)", pilgrim.fullName],
    ["ФИО (латиница)", pilgrim.fullName.toUpperCase().replaceAll("Ә", "A").replaceAll("Ғ", "G").replaceAll("Қ", "K").replaceAll("Ң", "N").replaceAll("Ө", "O").replaceAll("Ұ", "U").replaceAll("Ү", "U").replaceAll("Һ", "H").replaceAll("І", "I")],
    ["ИИН", maskIin(pilgrim.iin)],
    ["Дата рождения", pilgrim.dateOfBirth ? `${formatDate(pilgrim.dateOfBirth)} · ${calculateAge(pilgrim.dateOfBirth)} лет` : "не указана"],
    ["Пол", pilgrim.gender || "не указан"],
    ["Телефон", pilgrim.phone || "не указан"],
    ["Статус", pilgrim.status],
    ["Профессия", "паломник HajjCRM"],
  ] as const;
}

export function buildProfilePassportRows(pilgrim: PilgrimProfile) {
  return {
    passport: [
      ["Номер", `N ${pilgrim.id.slice(0, 8).toUpperCase()}`],
      ["Выдан", "МВД РК · 12.03.2022"],
      ["Действует до", "12.03.2032"],
      ["Страниц свободных", "14 из 36"],
    ],
    visa: [
      ["Номер заявки", `HJ-KZ-${new Date().getFullYear()}-${pilgrim.id.slice(-3)}`],
      ["Тип", "Hajj Visa · 1 въезд"],
      ["Подана", "через оператора"],
      ["Ожидаемая выдача", "до 12.05.2026"],
    ],
  };
}

export function buildProfileHealthRows(documents: DocumentRecord[]) {
  const vaccinationUploaded = documents.some((document) => document.type === "vaccination");

  return [
    { done: vaccinationUploaded, meta: vaccinationUploaded ? "сертификат загружен" : "нужно загрузить в документы", title: "Менингококковая ACWY" },
    { done: true, meta: "рекомендовано до вылета", title: "Жёлтая лихорадка" },
    { done: true, meta: "март 2026", title: "Сезонный грипп" },
    { done: false, meta: "рекомендовано до 01.05.2026", title: "COVID-19 booster" },
  ];
}

export function buildChecklistByCategory(items: ChecklistItem[]) {
  return (["documents", "health", "clothing", "finance", "spiritual"] as ChecklistCategory[]).map((category) => {
    const categoryItems = items.filter((item) => item.category === category);

    return {
      category,
      items: categoryItems,
      label: getChecklistLabel(category),
    };
  });
}

function calculateAge(dateOfBirth: string) {
  const birthDate = new Date(dateOfBirth);
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDelta = now.getMonth() - birthDate.getMonth();

  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return Math.max(age, 0);
}

export function buildContractPaymentRows(payment: PaymentRecord | null) {
  if (!payment) {
    return [];
  }

  return [
    ["Общая сумма", formatKzt(payment.totalAmount)],
    ["Оплачено", formatKzt(payment.paidAmount)],
    ["Остаток", formatKzt(Math.max(payment.totalAmount - payment.paidAmount, 0))],
    ["Способ оплаты", mapPaymentMethodLabel(payment.paymentMethod)],
  ] as const;
}
