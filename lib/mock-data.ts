import type {
  ChecklistItem,
  DocumentRecord,
  GroupRecord,
  NotificationRecord,
  Operator,
  OperatorReview,
  PaymentRecord,
  PilgrimGroupRecord,
  PilgrimProfile,
  PilgrimReadiness,
  TimelineEvent,
} from "@/types/domain";

const requiredDocumentTypes = [
  "passport",
  "medical_certificate",
  "photo",
  "questionnaire",
  "vaccination",
] as const;

export const operators: Operator[] = [
  {
    id: "op-al-safa",
    userId: "user-op-al-safa",
    companyName: "Al-Safa Hajj Travel",
    licenseNumber: "KZ-HJ-2026-001",
    licenseExpiry: "2026-12-31",
    isVerified: true,
    rating: 4.8,
    totalReviews: 128,
    phone: "+7 707 555 11 00",
    address: "Алматы, пр. Абая 150",
    description:
      "Премиальные хадж-группы с сопровождением на русском и казахском языках, персональным куратором и круглосуточной поддержкой.",
    createdAt: "2025-02-11T09:00:00.000Z",
  },
  {
    id: "op-nur-iman",
    userId: "user-op-nur-iman",
    companyName: "Nur Iman Tours",
    licenseNumber: "KZ-HJ-2026-017",
    licenseExpiry: "2026-11-30",
    isVerified: true,
    rating: 4.7,
    totalReviews: 86,
    phone: "+7 708 001 45 55",
    address: "Астана, ул. Сарайшык 34",
    description:
      "Оператор для семейных групп и паломников старшего возраста: рассрочка, спокойный график и выделенный медицинский куратор.",
    createdAt: "2025-04-18T09:00:00.000Z",
  },
  {
    id: "op-zamzam",
    userId: "user-op-zamzam",
    companyName: "Zamzam Group Kazakhstan",
    licenseNumber: "KZ-HJ-2026-024",
    licenseExpiry: "2027-01-12",
    isVerified: true,
    rating: 4.5,
    totalReviews: 41,
    phone: "+7 701 290 88 77",
    address: "Шымкент, пр. Тауке Хана 74",
    description:
      "Фокус на быстрый документооборот и рейсы из южных регионов Казахстана с собственной операторской стойкой в аэропорту.",
    createdAt: "2025-06-02T09:00:00.000Z",
  },
  {
    id: "op-baraka",
    userId: "user-op-baraka",
    companyName: "Baraka Pilgrim Service",
    licenseNumber: "KZ-HJ-2026-031",
    licenseExpiry: "2026-09-15",
    isVerified: false,
    rating: 3.9,
    totalReviews: 12,
    phone: "+7 747 225 40 80",
    address: "Туркестан, ул. Казыбек Би 8",
    description:
      "Новый оператор, ожидающий верификацию, со ставкой на региональные вылеты и короткие цепочки согласования.",
    createdAt: "2026-01-05T09:00:00.000Z",
  },
];

export const groups: GroupRecord[] = [
  {
    id: "grp-al-01",
    operatorId: "op-al-safa",
    name: "Хадж 2026 | Алматы A",
    flightDate: "2026-06-15",
    returnDate: "2026-07-03",
    hotelMecca: "Al Kiswah Towers",
    hotelMedina: "Dallah Taibah",
    quotaTotal: 48,
    quotaFilled: 39,
    guideName: "Мурат Абдуллаев",
    guidePhone: "+7 707 700 12 12",
    departureCity: "Almaty",
    status: "forming",
    createdAt: "2026-02-04T09:00:00.000Z",
    priceFrom: 1550000,
  },
  {
    id: "grp-al-02",
    operatorId: "op-al-safa",
    name: "Хадж 2026 | Алматы Premium",
    flightDate: "2026-06-22",
    returnDate: "2026-07-11",
    hotelMecca: "Swissotel Makkah",
    hotelMedina: "Anwar Al Madinah",
    quotaTotal: 32,
    quotaFilled: 31,
    guideName: "Рустем Жаксылыков",
    guidePhone: "+7 777 880 90 90",
    departureCity: "Almaty",
    status: "forming",
    createdAt: "2026-02-14T09:00:00.000Z",
    priceFrom: 2150000,
  },
  {
    id: "grp-ast-01",
    operatorId: "op-nur-iman",
    name: "Хадж 2026 | Астана",
    flightDate: "2026-07-05",
    returnDate: "2026-07-23",
    hotelMecca: "Mövenpick Residence",
    hotelMedina: "Pullman Zamzam",
    quotaTotal: 60,
    quotaFilled: 44,
    guideName: "Айдос Каримов",
    guidePhone: "+7 701 322 00 22",
    departureCity: "Astana",
    status: "forming",
    createdAt: "2026-02-27T09:00:00.000Z",
    priceFrom: 1620000,
  },
  {
    id: "grp-shy-01",
    operatorId: "op-zamzam",
    name: "Хадж 2026 | Шымкент",
    flightDate: "2026-06-28",
    returnDate: "2026-07-14",
    hotelMecca: "Emaar Grand",
    hotelMedina: "Saja Al Madinah",
    quotaTotal: 40,
    quotaFilled: 24,
    guideName: "Еркин Турсынов",
    guidePhone: "+7 747 199 40 40",
    departureCity: "Shymkent",
    status: "forming",
    createdAt: "2026-03-05T09:00:00.000Z",
    priceFrom: 1480000,
  },
];

export const pilgrims: PilgrimProfile[] = [
  {
    id: "pl-erlan",
    userId: "user-pl-erlan",
    operatorId: "op-al-safa",
    fullName: "Ерлан Тулеуов",
    iin: "870112300111",
    phone: "+7 701 111 22 33",
    dateOfBirth: "1987-01-12",
    gender: "male",
    status: "ready",
    createdAt: "2026-03-01T09:00:00.000Z",
  },
  {
    id: "pl-aigerim",
    userId: "user-pl-aigerim",
    operatorId: "op-al-safa",
    fullName: "Айгерим Нурбекова",
    iin: "920611400221",
    phone: "+7 702 444 55 66",
    dateOfBirth: "1992-06-11",
    gender: "female",
    status: "payment_partial",
    createdAt: "2026-03-03T09:00:00.000Z",
  },
  {
    id: "pl-nursultan",
    userId: "user-pl-nursultan",
    operatorId: "op-al-safa",
    fullName: "Нурсултан Омаров",
    iin: "950921300444",
    phone: "+7 775 900 10 10",
    dateOfBirth: "1995-09-21",
    gender: "male",
    status: "docs_pending",
    createdAt: "2026-03-11T09:00:00.000Z",
  },
  {
    id: "pl-gulmira",
    userId: "user-pl-gulmira",
    operatorId: "op-nur-iman",
    fullName: "Гульмира Садыкова",
    iin: "780429400555",
    phone: "+7 707 777 88 90",
    dateOfBirth: "1978-04-29",
    gender: "female",
    status: "ready",
    createdAt: "2026-02-25T09:00:00.000Z",
  },
  {
    id: "pl-bekzat",
    userId: "user-pl-bekzat",
    operatorId: "op-nur-iman",
    fullName: "Бекзат Мухтаров",
    iin: "880814301234",
    phone: "+7 702 120 45 67",
    dateOfBirth: "1988-08-14",
    gender: "male",
    status: "payment_pending",
    createdAt: "2026-03-08T09:00:00.000Z",
  },
  {
    id: "pl-sabina",
    userId: "user-pl-sabina",
    operatorId: "op-zamzam",
    fullName: "Сабина Ермекова",
    iin: "990210400999",
    phone: "+7 700 808 40 40",
    dateOfBirth: "1999-02-10",
    gender: "female",
    status: "docs_pending",
    createdAt: "2026-03-17T09:00:00.000Z",
  },
];

export const documents: DocumentRecord[] = [
  {
    id: "doc-erlan-passport",
    pilgrimId: "pl-erlan",
    type: "passport",
    fileUrl: "/demo/passport-erlan.pdf",
    fileName: "passport-erlan.pdf",
    isVerified: true,
    uploadedAt: "2026-03-04T12:00:00.000Z",
  },
  {
    id: "doc-erlan-med",
    pilgrimId: "pl-erlan",
    type: "medical_certificate",
    fileUrl: "/demo/medical-erlan.pdf",
    fileName: "medical-erlan.pdf",
    isVerified: true,
    uploadedAt: "2026-03-05T12:00:00.000Z",
  },
  {
    id: "doc-erlan-photo",
    pilgrimId: "pl-erlan",
    type: "photo",
    fileUrl: "/demo/photo-erlan.jpg",
    fileName: "photo-erlan.jpg",
    isVerified: true,
    uploadedAt: "2026-03-05T13:00:00.000Z",
  },
  {
    id: "doc-erlan-questionnaire",
    pilgrimId: "pl-erlan",
    type: "questionnaire",
    fileUrl: "/demo/questionnaire-erlan.pdf",
    fileName: "questionnaire-erlan.pdf",
    isVerified: true,
    uploadedAt: "2026-03-06T12:00:00.000Z",
  },
  {
    id: "doc-erlan-vaccination",
    pilgrimId: "pl-erlan",
    type: "vaccination",
    fileUrl: "/demo/vaccination-erlan.pdf",
    fileName: "vaccination-erlan.pdf",
    isVerified: true,
    uploadedAt: "2026-03-07T12:00:00.000Z",
  },
  {
    id: "doc-aigerim-passport",
    pilgrimId: "pl-aigerim",
    type: "passport",
    fileUrl: "/demo/passport-aigerim.pdf",
    fileName: "passport-aigerim.pdf",
    isVerified: true,
    uploadedAt: "2026-03-07T12:00:00.000Z",
  },
  {
    id: "doc-aigerim-med",
    pilgrimId: "pl-aigerim",
    type: "medical_certificate",
    fileUrl: "/demo/medical-aigerim.pdf",
    fileName: "medical-aigerim.pdf",
    isVerified: true,
    uploadedAt: "2026-03-09T12:00:00.000Z",
  },
  {
    id: "doc-aigerim-photo",
    pilgrimId: "pl-aigerim",
    type: "photo",
    fileUrl: "/demo/photo-aigerim.jpg",
    fileName: "photo-aigerim.jpg",
    isVerified: true,
    uploadedAt: "2026-03-11T12:00:00.000Z",
  },
  {
    id: "doc-aigerim-questionnaire",
    pilgrimId: "pl-aigerim",
    type: "questionnaire",
    fileUrl: "/demo/questionnaire-aigerim.pdf",
    fileName: "questionnaire-aigerim.pdf",
    isVerified: false,
    uploadedAt: "2026-03-12T12:00:00.000Z",
  },
  {
    id: "doc-nursultan-passport",
    pilgrimId: "pl-nursultan",
    type: "passport",
    fileUrl: "/demo/passport-nursultan.pdf",
    fileName: "passport-nursultan.pdf",
    isVerified: false,
    uploadedAt: "2026-03-18T12:00:00.000Z",
  },
  {
    id: "doc-nursultan-photo",
    pilgrimId: "pl-nursultan",
    type: "photo",
    fileUrl: "/demo/photo-nursultan.jpg",
    fileName: "photo-nursultan.jpg",
    isVerified: false,
    uploadedAt: "2026-03-18T15:00:00.000Z",
  },
  {
    id: "doc-gulmira-passport",
    pilgrimId: "pl-gulmira",
    type: "passport",
    fileUrl: "/demo/passport-gulmira.pdf",
    fileName: "passport-gulmira.pdf",
    isVerified: true,
    uploadedAt: "2026-02-27T12:00:00.000Z",
  },
  {
    id: "doc-gulmira-med",
    pilgrimId: "pl-gulmira",
    type: "medical_certificate",
    fileUrl: "/demo/medical-gulmira.pdf",
    fileName: "medical-gulmira.pdf",
    isVerified: true,
    uploadedAt: "2026-02-28T12:00:00.000Z",
  },
  {
    id: "doc-gulmira-photo",
    pilgrimId: "pl-gulmira",
    type: "photo",
    fileUrl: "/demo/photo-gulmira.jpg",
    fileName: "photo-gulmira.jpg",
    isVerified: true,
    uploadedAt: "2026-02-28T13:00:00.000Z",
  },
  {
    id: "doc-gulmira-questionnaire",
    pilgrimId: "pl-gulmira",
    type: "questionnaire",
    fileUrl: "/demo/questionnaire-gulmira.pdf",
    fileName: "questionnaire-gulmira.pdf",
    isVerified: true,
    uploadedAt: "2026-03-01T12:00:00.000Z",
  },
  {
    id: "doc-gulmira-vaccination",
    pilgrimId: "pl-gulmira",
    type: "vaccination",
    fileUrl: "/demo/vaccination-gulmira.pdf",
    fileName: "vaccination-gulmira.pdf",
    isVerified: true,
    uploadedAt: "2026-03-02T12:00:00.000Z",
  },
  {
    id: "doc-bekzat-passport",
    pilgrimId: "pl-bekzat",
    type: "passport",
    fileUrl: "/demo/passport-bekzat.pdf",
    fileName: "passport-bekzat.pdf",
    isVerified: true,
    uploadedAt: "2026-03-12T12:00:00.000Z",
  },
  {
    id: "doc-bekzat-med",
    pilgrimId: "pl-bekzat",
    type: "medical_certificate",
    fileUrl: "/demo/medical-bekzat.pdf",
    fileName: "medical-bekzat.pdf",
    isVerified: false,
    uploadedAt: "2026-03-13T12:00:00.000Z",
  },
  {
    id: "doc-bekzat-photo",
    pilgrimId: "pl-bekzat",
    type: "photo",
    fileUrl: "/demo/photo-bekzat.jpg",
    fileName: "photo-bekzat.jpg",
    isVerified: true,
    uploadedAt: "2026-03-13T16:00:00.000Z",
  },
  {
    id: "doc-bekzat-questionnaire",
    pilgrimId: "pl-bekzat",
    type: "questionnaire",
    fileUrl: "/demo/questionnaire-bekzat.pdf",
    fileName: "questionnaire-bekzat.pdf",
    isVerified: true,
    uploadedAt: "2026-03-14T12:00:00.000Z",
  },
  {
    id: "doc-bekzat-vaccination",
    pilgrimId: "pl-bekzat",
    type: "vaccination",
    fileUrl: "/demo/vaccination-bekzat.pdf",
    fileName: "vaccination-bekzat.pdf",
    isVerified: false,
    uploadedAt: "2026-03-15T12:00:00.000Z",
  },
  {
    id: "doc-sabina-passport",
    pilgrimId: "pl-sabina",
    type: "passport",
    fileUrl: "/demo/passport-sabina.pdf",
    fileName: "passport-sabina.pdf",
    isVerified: false,
    uploadedAt: "2026-03-20T10:00:00.000Z",
  },
];

export const pilgrimGroups: PilgrimGroupRecord[] = [
  {
    pilgrimId: "pl-erlan",
    groupId: "grp-al-01",
    joinedAt: "2026-03-20T12:00:00.000Z",
  },
  {
    pilgrimId: "pl-aigerim",
    groupId: "grp-al-01",
    joinedAt: "2026-03-22T12:00:00.000Z",
  },
  {
    pilgrimId: "pl-gulmira",
    groupId: "grp-ast-01",
    joinedAt: "2026-03-09T12:00:00.000Z",
  },
  {
    pilgrimId: "pl-sabina",
    groupId: "grp-shy-01",
    joinedAt: "2026-03-23T12:00:00.000Z",
  },
];

export const payments: PaymentRecord[] = [
  {
    id: "pay-erlan",
    pilgrimId: "pl-erlan",
    operatorId: "op-al-safa",
    totalAmount: 1550000,
    paidAmount: 1550000,
    paymentMethod: "kaspi",
    installmentPlan: false,
    installmentMonths: null,
    status: "paid",
    contractUrl: "/demo/contracts/erlan-contract.pdf",
    qrCode: "QR-HJ-ERLAN-2026",
    contractGeneratedAt: "2026-03-25T09:00:00.000Z",
    createdAt: "2026-03-05T09:00:00.000Z",
  },
  {
    id: "pay-aigerim",
    pilgrimId: "pl-aigerim",
    operatorId: "op-al-safa",
    totalAmount: 1550000,
    paidAmount: 950000,
    paymentMethod: "halyk",
    installmentPlan: true,
    installmentMonths: 3,
    status: "partial",
    contractUrl: "/demo/contracts/aigerim-contract.pdf",
    qrCode: "QR-HJ-AIGERIM-2026",
    contractGeneratedAt: "2026-03-19T09:00:00.000Z",
    createdAt: "2026-03-09T09:00:00.000Z",
  },
  {
    id: "pay-nursultan",
    pilgrimId: "pl-nursultan",
    operatorId: "op-al-safa",
    totalAmount: 1620000,
    paidAmount: 200000,
    paymentMethod: "transfer",
    installmentPlan: true,
    installmentMonths: 4,
    status: "pending",
    contractUrl: null,
    qrCode: null,
    contractGeneratedAt: null,
    createdAt: "2026-03-18T09:00:00.000Z",
  },
  {
    id: "pay-gulmira",
    pilgrimId: "pl-gulmira",
    operatorId: "op-nur-iman",
    totalAmount: 1620000,
    paidAmount: 1620000,
    paymentMethod: "kaspi",
    installmentPlan: false,
    installmentMonths: null,
    status: "paid",
    contractUrl: "/demo/contracts/gulmira-contract.pdf",
    qrCode: "QR-HJ-GULMIRA-2026",
    contractGeneratedAt: "2026-03-16T09:00:00.000Z",
    createdAt: "2026-03-01T09:00:00.000Z",
  },
  {
    id: "pay-bekzat",
    pilgrimId: "pl-bekzat",
    operatorId: "op-nur-iman",
    totalAmount: 1620000,
    paidAmount: 640000,
    paymentMethod: "cash",
    installmentPlan: true,
    installmentMonths: 4,
    status: "pending",
    contractUrl: "/demo/contracts/bekzat-contract.pdf",
    qrCode: "QR-HJ-BEKZAT-2026",
    contractGeneratedAt: "2026-03-17T09:00:00.000Z",
    createdAt: "2026-03-11T09:00:00.000Z",
  },
  {
    id: "pay-sabina",
    pilgrimId: "pl-sabina",
    operatorId: "op-zamzam",
    totalAmount: 1480000,
    paidAmount: 480000,
    paymentMethod: "kaspi",
    installmentPlan: true,
    installmentMonths: 5,
    status: "partial",
    contractUrl: "/demo/contracts/sabina-contract.pdf",
    qrCode: "QR-HJ-SABINA-2026",
    contractGeneratedAt: "2026-03-26T09:00:00.000Z",
    createdAt: "2026-03-18T09:00:00.000Z",
  },
];

export const reviews: OperatorReview[] = [
  {
    id: "review-1",
    operatorId: "op-al-safa",
    pilgrimId: "pl-erlan",
    rating: 5,
    comment: "Документы и перелёт были организованы без срывов, куратор отвечал даже ночью.",
    isVisible: true,
    createdAt: "2026-03-30T09:00:00.000Z",
  },
  {
    id: "review-2",
    operatorId: "op-al-safa",
    pilgrimId: "pl-aigerim",
    rating: 4,
    comment: "Удобная рассрочка и понятный кабинет, хотелось бы быстрее верификацию фото.",
    isVisible: true,
    createdAt: "2026-03-27T09:00:00.000Z",
  },
  {
    id: "review-3",
    operatorId: "op-nur-iman",
    pilgrimId: "pl-gulmira",
    rating: 5,
    comment: "Особенно ценна поддержка пожилых паломников и напоминания по чек-листу.",
    isVisible: true,
    createdAt: "2026-03-22T09:00:00.000Z",
  },
];

export const notifications: NotificationRecord[] = [
  {
    id: "not-1",
    pilgrimId: "pl-erlan",
    operatorId: "op-al-safa",
    channel: "whatsapp",
    type: "checklist",
    message: "До вылета 14 дней. Проверьте чек-лист и распечатайте договор.",
    status: "sent",
    scheduledAt: "2026-06-01T06:00:00.000Z",
    sentAt: "2026-06-01T06:02:00.000Z",
  },
  {
    id: "not-2",
    pilgrimId: "pl-aigerim",
    operatorId: "op-al-safa",
    channel: "whatsapp",
    type: "reminder_payment",
    message: "Остаток по оплате 600 000 ₸. Закройте платёж до 1 июня.",
    status: "queued",
    scheduledAt: "2026-05-20T06:00:00.000Z",
    sentAt: null,
  },
  {
    id: "not-3",
    pilgrimId: "pl-nursultan",
    operatorId: "op-al-safa",
    channel: "sms",
    type: "reminder_docs",
    message: "Не хватает анкеты, медсправки и сертификата вакцинации.",
    status: "queued",
    scheduledAt: "2026-05-20T06:00:00.000Z",
    sentAt: null,
  },
  {
    id: "not-4",
    pilgrimId: "pl-gulmira",
    operatorId: "op-nur-iman",
    channel: "in_app",
    type: "welcome",
    message: "Добро пожаловать в личный кабинет паломника. Здесь будут договор, QR и график группы.",
    status: "sent",
    scheduledAt: "2026-03-01T06:00:00.000Z",
    sentAt: "2026-03-01T06:00:01.000Z",
  },
];

export const checklistItems: ChecklistItem[] = [
  {
    id: "check-1",
    pilgrimId: "pl-erlan",
    itemName: "Проверить оригинал паспорта",
    category: "documents",
    isChecked: true,
  },
  {
    id: "check-2",
    pilgrimId: "pl-erlan",
    itemName: "Купить лёгкую обувь для тавафа",
    category: "clothing",
    isChecked: true,
  },
  {
    id: "check-3",
    pilgrimId: "pl-erlan",
    itemName: "Подготовить наличные на личные расходы",
    category: "finance",
    isChecked: false,
  },
  {
    id: "check-4",
    pilgrimId: "pl-erlan",
    itemName: "Скачать аудио-дуа в телефон",
    category: "spiritual",
    isChecked: true,
  },
  {
    id: "check-5",
    pilgrimId: "pl-aigerim",
    itemName: "Завершить оплату второго платежа",
    category: "finance",
    isChecked: false,
  },
  {
    id: "check-6",
    pilgrimId: "pl-aigerim",
    itemName: "Загрузить сертификат вакцинации",
    category: "health",
    isChecked: false,
  },
  {
    id: "check-7",
    pilgrimId: "pl-aigerim",
    itemName: "Распечатать договор и QR",
    category: "documents",
    isChecked: true,
  },
  {
    id: "check-8",
    pilgrimId: "pl-aigerim",
    itemName: "Подготовить удобную обувь и сумку",
    category: "clothing",
    isChecked: false,
  },
  {
    id: "check-9",
    pilgrimId: "pl-aigerim",
    itemName: "Собрать список молитв и заметок",
    category: "spiritual",
    isChecked: true,
  },
];

export const timelineEvents: TimelineEvent[] = [
  {
    id: "time-1",
    pilgrimId: "pl-aigerim",
    title: "Загружена анкета",
    detail: "Ожидает проверки оператором",
    timestamp: "2026-03-12T12:00:00.000Z",
  },
  {
    id: "time-2",
    pilgrimId: "pl-aigerim",
    title: "Частичный платёж получен",
    detail: "950 000 ₸ через Halyk",
    timestamp: "2026-03-19T09:00:00.000Z",
  },
  {
    id: "time-3",
    pilgrimId: "pl-aigerim",
    title: "Назначена в группу",
    detail: "Хадж 2026 | Алматы A",
    timestamp: "2026-03-22T12:00:00.000Z",
  },
];

export function getOperatorById(id: string) {
  return operators.find((operator) => operator.id === id);
}

export function getPilgrimById(id: string) {
  return pilgrims.find((pilgrim) => pilgrim.id === id);
}

export function getPilgrimByUserId(userId: string) {
  return pilgrims.find((pilgrim) => pilgrim.userId === userId);
}

export function getOperatorGroups(operatorId: string) {
  return groups.filter((group) => group.operatorId === operatorId);
}

export function getPilgrimDocuments(pilgrimId: string) {
  return documents.filter((document) => document.pilgrimId === pilgrimId);
}

export function getPilgrimPayment(pilgrimId: string) {
  return payments.find((payment) => payment.pilgrimId === pilgrimId) ?? null;
}

export function getPilgrimGroup(pilgrimId: string) {
  const relation = pilgrimGroups.find((record) => record.pilgrimId === pilgrimId);
  return relation ? groups.find((group) => group.id === relation.groupId) ?? null : null;
}

export function getOperatorReviews(operatorId: string) {
  return reviews.filter((review) => review.operatorId === operatorId && review.isVisible);
}

export function getPilgrimNotifications(pilgrimId: string) {
  return notifications.filter((notification) => notification.pilgrimId === pilgrimId);
}

export function getPilgrimChecklist(pilgrimId: string) {
  return checklistItems.filter((item) => item.pilgrimId === pilgrimId);
}

export function getPilgrimTimeline(pilgrimId: string) {
  return timelineEvents.filter((entry) => entry.pilgrimId === pilgrimId);
}

export function getPilgrimReadiness(pilgrimId: string): PilgrimReadiness {
  const docsCount = new Set(getPilgrimDocuments(pilgrimId).map((document) => document.type)).size;
  const payment = getPilgrimPayment(pilgrimId);
  const group = getPilgrimGroup(pilgrimId);
  const isPaymentComplete = payment?.status === "paid";
  const isInGroup = Boolean(group);
  const readinessPercent = Math.round(((docsCount + Number(isPaymentComplete) + Number(isInGroup)) / 7) * 100);

  return {
    pilgrimId,
    docsCount,
    isPaymentComplete,
    isInGroup,
    readinessPercent,
    isReady: docsCount === requiredDocumentTypes.length && isPaymentComplete && isInGroup,
  };
}

export function getReadinessView() {
  return pilgrims.map((pilgrim) => getPilgrimReadiness(pilgrim.id));
}

export function getVerifiedOperators() {
  return operators.filter((operator) => operator.isVerified);
}

export function getPrimaryCity(operatorId: string) {
  return getOperatorGroups(operatorId)[0]?.departureCity ?? "Almaty";
}

export function getQuotaLeft(operatorId: string) {
  return getOperatorGroups(operatorId).reduce(
    (sum, group) => sum + Math.max(group.quotaTotal - group.quotaFilled, 0),
    0,
  );
}

export function getOperatorRevenue(operatorId: string) {
  return payments
    .filter((payment) => payment.operatorId === operatorId)
    .reduce((sum, payment) => sum + payment.paidAmount, 0);
}

export function getOperatorPilgrims(operatorId: string) {
  return pilgrims.filter((pilgrim) => pilgrim.operatorId === operatorId);
}

export function getOperatorReadyCount(operatorId: string) {
  return getOperatorPilgrims(operatorId).filter((pilgrim) => getPilgrimReadiness(pilgrim.id).isReady).length;
}

export function getPublicVerification(qrCode: string) {
  const payment = payments.find((entry) => entry.qrCode === qrCode);

  if (!payment) {
    return null;
  }

  const pilgrim = getPilgrimById(payment.pilgrimId);
  const operator = getOperatorById(payment.operatorId);

  if (!pilgrim || !operator) {
    return null;
  }

  return {
    payment,
    pilgrim,
    operator,
  };
}
