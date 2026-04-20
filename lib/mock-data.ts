import type {
  ChecklistItem,
  DocumentRecord,
  GroupRecord,
  NotificationRecord,
  Operator,
  OperatorReview,
  PaymentMethod,
  PaymentRecord,
  PaymentStatus,
  PilgrimGroupRecord,
  PilgrimProfile,
  PilgrimReadiness,
  PilgrimStatus,
  TimelineEvent,
} from "@/types/domain";

const requiredDocumentTypes = [
  "passport",
  "medical_certificate",
  "photo",
  "questionnaire",
  "vaccination",
] as const;

const groupIds = {
  astana: "grp-astana-premium",
  medina: "grp-medina-pervaya",
  ramadan: "grp-ramazan-2026",
} as const;

type OperatorSeed = {
  address: string;
  city: string;
  companyName: string;
  description?: string;
  id: string;
  isVerified?: boolean;
  phone?: string;
  rating?: number;
  totalReviews?: number;
};

type PilgrimSeed = {
  contractGeneratedAt?: string | null;
  contractUrl?: string | null;
  createdAt: string;
  dateOfBirth: string;
  docsCount: number;
  fullName: string;
  gender: "female" | "male";
  groupId: string;
  id: string;
  iin: string;
  installmentMonths?: number | null;
  installmentPlan?: boolean;
  paidAmount?: number;
  paymentCreatedAt?: string;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  phone: string;
  qrCode?: string | null;
  status: PilgrimStatus;
  totalAmount?: number;
};

function slugifyId(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function makeOperatorPhone(index: number) {
  const middle = String(110 + index * 7).padStart(3, "0");
  const tail = String(10 + ((index * 13) % 80)).padStart(2, "0");
  const last = String(10 + ((index * 17) % 80)).padStart(2, "0");
  return `+7 70${(index % 8) + 1} ${middle} ${tail} ${last}`;
}

function makeLicense(index: number) {
  return `KZ-HJ-2026-${String(index + 1).padStart(3, "0")}`;
}

function buildOperatorDescription(companyName: string, city: string) {
  return `${companyName} ведёт хадж-группы из ${city}, работает с русскоязычными и казахоязычными паломниками и держит единый контроль документов, оплаты и вылетов через HajjCRM.`;
}

function makeCreatedAt(month: number, day: number) {
  return `2025-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T09:00:00.000Z`;
}

const coreOperatorSeeds: OperatorSeed[] = [
  {
    address: "Алматы, пр. Абая 150",
    city: "Алматы",
    companyName: "Al-Safa Hajj Travel",
    description:
      "Премиальные хадж-группы с сопровождением на русском и казахском языках, персональным куратором и круглосуточной поддержкой.",
    id: "op-al-safa",
    phone: "+7 707 555 11 00",
    rating: 4.8,
    totalReviews: 128,
  },
  {
    address: "Астана, ул. Сарайшык 34",
    city: "Астана",
    companyName: "Nur Iman Tours",
    description:
      "Оператор для семейных групп и паломников старшего возраста: рассрочка, спокойный график и выделенный медицинский куратор.",
    id: "op-nur-iman",
    phone: "+7 708 001 45 55",
    rating: 4.7,
    totalReviews: 86,
  },
  {
    address: "Шымкент, пр. Тауке Хана 74",
    city: "Шымкент",
    companyName: "Zamzam Group Kazakhstan",
    description:
      "Фокус на быстрый документооборот и рейсы из южных регионов Казахстана с собственной операторской стойкой в аэропорту.",
    id: "op-zamzam",
    phone: "+7 701 290 88 77",
    rating: 4.5,
    totalReviews: 41,
  },
  {
    address: "Туркестан, ул. Казыбек Би 8",
    city: "Туркестан",
    companyName: "Baraka Hajj Services",
    description:
      "Новый оператор, ожидающий финальную проверку, со ставкой на региональные вылеты и короткие цепочки согласования.",
    id: "op-baraka",
    isVerified: false,
    phone: "+7 747 225 40 80",
    rating: 4.1,
    totalReviews: 18,
  },
];

const generatedOperatorNames = [
  "Aqniet Hajj Tours",
  "Haj Kazakhstan Ltd",
  "Salam Tourism",
  "Mecca Direct KZ",
  "Al-Madinah Travel",
  "Nur Safar",
  "Hajj Expert Group",
  "Qibla Voyage",
  "Darhan Umrah Center",
  "Tauhid Travel KZ",
  "Safa Premium Tours",
  "Medina Line Kazakhstan",
  "Al Amanat Hajj",
  "Qazaq Pilgrim Service",
  "Aruana Hajj Club",
  "Qamqor Travel",
  "Rahma Tour Kazakhstan",
  "Iman Capital Travel",
  "Miras Hajj Solutions",
  "Amal Safar",
  "Atlas Hajj KZ",
  "Tumar Travel House",
  "Altyn Qadam Hajj",
  "Taza Zhol Pilgrim",
  "Silk Road Hajj",
  "Nurly Meken Tours",
  "Ihlas Voyage",
  "Al-Fajr Kazakhstan",
  "Mahabba Hajj Service",
  "Sapar KZ Hajj",
  "Amanat Routes",
  "Qutty Jol Travel",
  "Harmain Connect KZ",
  "Qazaq Zamzam Line",
  "Ihsan Pilgrim Desk",
  "Qamar Hajj Travel",
  "Madina Gate KZ",
  "Baitullah Service",
  "Tolebi Hajj Center",
  "Damu Pilgrim Group",
  "Bereke Safar",
  "Taza Niyet Travel",
  "Orda Hajj Network",
];

const operatorAddressPool = [
  { address: "Алматы, пр. Достык 98", city: "Алматы" },
  { address: "Астана, ул. Кунаева 12", city: "Астана" },
  { address: "Шымкент, ул. Аль-Фараби 41", city: "Шымкент" },
  { address: "Туркестан, пр. Тәуке хан 19", city: "Туркестан" },
  { address: "Актау, мкр. 15, дом 27", city: "Актау" },
  { address: "Алматы, ул. Розыбакиева 121", city: "Алматы" },
  { address: "Астана, пр. Кабанбай батыр 45", city: "Астана" },
];

const allOperatorSeeds: OperatorSeed[] = [
  ...coreOperatorSeeds,
  ...generatedOperatorNames.map((companyName, index) => {
    const location = operatorAddressPool[index % operatorAddressPool.length];
    return {
      address: location.address,
      city: location.city,
      companyName,
      id: `op-${slugifyId(companyName)}`,
    };
  }),
];

export const operators: Operator[] = allOperatorSeeds.map((seed, index) => ({
  address: seed.address,
  companyName: seed.companyName,
  createdAt: makeCreatedAt(((index + 1) % 12) + 1, ((index * 3) % 24) + 1),
  description: seed.description ?? buildOperatorDescription(seed.companyName, seed.city),
  id: seed.id,
  isVerified: seed.isVerified ?? index !== 3,
  licenseExpiry: `2027-${String(((index + 4) % 12) + 1).padStart(2, "0")}-28`,
  licenseNumber: makeLicense(index),
  phone: seed.phone ?? makeOperatorPhone(index),
  rating: seed.rating ?? Number((4 + ((index % 9) + 1) / 10).toFixed(1)),
  totalReviews: seed.totalReviews ?? 24 + index * 6,
  userId: `user-${seed.id}`,
}));

export const groups: GroupRecord[] = [
  {
    createdAt: "2026-02-01T09:00:00.000Z",
    departureCity: "Almaty",
    flightDate: "2026-06-12",
    guideName: "Бауыржан Тулегенов",
    guidePhone: "+7 707 555 11 24",
    hotelMecca: "Hilton Suites Makkah",
    hotelMedina: "Anwar Al Madinah Mövenpick",
    id: groupIds.ramadan,
    name: "Рамазан-2026",
    operatorId: "op-al-safa",
    priceFrom: 2850000,
    quotaFilled: 37,
    quotaTotal: 45,
    returnDate: "2026-06-28",
    status: "forming",
  },
  {
    createdAt: "2026-02-04T09:00:00.000Z",
    departureCity: "Almaty",
    flightDate: "2026-06-14",
    guideName: "Нұргүл Кенжебаева",
    guidePhone: "+7 701 440 55 66",
    hotelMecca: "Address Jabal Omar",
    hotelMedina: "Sofitel Shahd Al Madinah",
    id: groupIds.medina,
    name: "Медина-Первая",
    operatorId: "op-al-safa",
    priceFrom: 2950000,
    quotaFilled: 33,
    quotaTotal: 45,
    returnDate: "2026-06-30",
    status: "forming",
  },
  {
    createdAt: "2026-02-08T09:00:00.000Z",
    departureCity: "Astana",
    flightDate: "2026-06-18",
    guideName: "Айгерім Сарсен",
    guidePhone: "+7 708 777 12 33",
    hotelMecca: "Conrad Jabal Omar",
    hotelMedina: "Madinah Hilton",
    id: groupIds.astana,
    name: "Астана-Премиум",
    operatorId: "op-al-safa",
    priceFrom: 3100000,
    quotaFilled: 37,
    quotaTotal: 40,
    returnDate: "2026-07-03",
    status: "forming",
  },
];

function makeGeneratedPhone(index: number) {
  const prefix = 700 + (index % 9) * 5;
  const middle = String(200 + index * 7).padStart(3, "0");
  const tail = String(10 + (index * 3) % 80).padStart(2, "0");
  const last = String(11 + (index * 5) % 80).padStart(2, "0");
  return `+7 ${prefix} ${middle} ${tail} ${last}`;
}

function makeGeneratedBirthDate(index: number) {
  const year = 1974 + (index % 24);
  const month = ((index * 2) % 12) + 1;
  const day = ((index * 3) % 27) + 1;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function makeGeneratedIin(index: number, birthDate: string, gender: "female" | "male") {
  const [year, month, day] = birthDate.split("-").map(Number);
  const shortYear = String(year).slice(2);
  const genderDigit = gender === "male" ? 3 : 4;
  return `${shortYear}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}${genderDigit}${String(100000 + index).slice(1)}`;
}

function inferGeneratedStatus(docsCount: number): PilgrimStatus {
  if (docsCount >= 5) {
    return "payment_pending";
  }
  if (docsCount >= 3) {
    return "docs_pending";
  }
  return "new";
}

const manualPilgrimSeeds: PilgrimSeed[] = [
  {
    contractGeneratedAt: "2026-03-12T14:32:00.000Z",
    contractUrl: "/demo/contracts/erlan-mukhametov.pdf",
    createdAt: "2026-02-12T09:00:00.000Z",
    dateOfBirth: "1990-08-15",
    docsCount: 4,
    fullName: "Ерлан Мухаметов",
    gender: "male",
    groupId: groupIds.ramadan,
    id: "pl-erlan",
    iin: "900815500123",
    installmentMonths: 6,
    installmentPlan: true,
    paidAmount: 1995000,
    paymentCreatedAt: "2026-03-12T14:15:00.000Z",
    paymentMethod: "kaspi",
    paymentStatus: "partial",
    phone: "+7 707 555 11 23",
    qrCode: "QR-HJ-2026-ERLAN-A4",
    status: "payment_partial",
    totalAmount: 2850000,
  },
  {
    contractGeneratedAt: "2026-02-18T11:10:00.000Z",
    contractUrl: "/demo/contracts/aigul-nurkozhaeva.pdf",
    createdAt: "2026-02-15T09:00:00.000Z",
    dateOfBirth: "1989-04-12",
    docsCount: 5,
    fullName: "Айгүл Нұрқожаева",
    gender: "female",
    groupId: groupIds.astana,
    id: "pl-aigerim",
    iin: "890412400445",
    installmentMonths: 12,
    installmentPlan: true,
    paidAmount: 3100000,
    paymentCreatedAt: "2026-04-06T18:40:00.000Z",
    paymentMethod: "halyk",
    paymentStatus: "paid",
    phone: "+7 701 222 33 44",
    qrCode: "QR-HJ-2026-AIGUL-A5",
    status: "ready",
    totalAmount: 3100000,
  },
  {
    contractGeneratedAt: "2026-02-20T09:30:00.000Z",
    contractUrl: "/demo/contracts/marat-ospanov.pdf",
    createdAt: "2026-02-18T09:00:00.000Z",
    dateOfBirth: "1982-07-08",
    docsCount: 2,
    fullName: "Марат Оспанов",
    gender: "male",
    groupId: groupIds.medina,
    id: "pl-marat",
    iin: "820708300210",
    installmentMonths: 6,
    installmentPlan: true,
    paidAmount: 1240000,
    paymentCreatedAt: "2026-04-02T11:05:00.000Z",
    paymentMethod: "kaspi",
    paymentStatus: "partial",
    phone: "+7 705 777 88 99",
    qrCode: "QR-HJ-2026-MARAT-A6",
    status: "docs_pending",
    totalAmount: 2950000,
  },
  {
    contractGeneratedAt: "2026-02-22T13:15:00.000Z",
    contractUrl: "/demo/contracts/bauyrzhan-tulegenov.pdf",
    createdAt: "2026-02-20T09:00:00.000Z",
    dateOfBirth: "1985-10-20",
    docsCount: 3,
    fullName: "Бауыржан Тулегенов",
    gender: "male",
    groupId: groupIds.ramadan,
    id: "pl-bauyrzhan",
    iin: "850811300654",
    installmentMonths: 6,
    installmentPlan: true,
    paidAmount: 1000000,
    paymentCreatedAt: "2026-03-22T13:15:00.000Z",
    paymentMethod: "halyk",
    paymentStatus: "partial",
    phone: "+7 702 510 22 18",
    qrCode: "QR-HJ-2026-BAUYRZHAN-A8",
    status: "payment_partial",
    totalAmount: 2850000,
  },
  {
    contractGeneratedAt: "2026-02-25T10:00:00.000Z",
    contractUrl: "/demo/contracts/nurlan-abdigaparov.pdf",
    createdAt: "2026-02-22T09:00:00.000Z",
    dateOfBirth: "1979-05-30",
    docsCount: 5,
    fullName: "Нұрлан Әбдіғапаров",
    gender: "male",
    groupId: groupIds.astana,
    id: "pl-nurlan",
    iin: "790530300684",
    installmentMonths: null,
    installmentPlan: false,
    paidAmount: 2850000,
    paymentCreatedAt: "2026-02-25T10:15:00.000Z",
    paymentMethod: "transfer",
    paymentStatus: "paid",
    phone: "+7 775 333 11 19",
    qrCode: "QR-HJ-2026-NURLAN-A10",
    status: "ready",
    totalAmount: 2850000,
  },
  {
    contractGeneratedAt: "2026-02-26T08:40:00.000Z",
    contractUrl: "/demo/contracts/zhanna-sarsenova.pdf",
    createdAt: "2026-02-23T09:00:00.000Z",
    dateOfBirth: "1988-11-17",
    docsCount: 4,
    fullName: "Жанна Сарсенова",
    gender: "female",
    groupId: groupIds.ramadan,
    id: "pl-zhanna",
    iin: "881117400287",
    installmentMonths: 6,
    installmentPlan: true,
    paidAmount: 1850000,
    paymentCreatedAt: "2026-03-25T08:00:00.000Z",
    paymentMethod: "kaspi",
    paymentStatus: "partial",
    phone: "+7 708 411 20 65",
    qrCode: "QR-HJ-2026-ZHANNA-A9",
    status: "payment_partial",
    totalAmount: 2850000,
  },
  {
    contractGeneratedAt: "2026-02-28T09:15:00.000Z",
    contractUrl: "/demo/contracts/askhat-kenesov.pdf",
    createdAt: "2026-02-25T09:00:00.000Z",
    dateOfBirth: "1984-09-09",
    docsCount: 5,
    fullName: "Асхат Кенесов",
    gender: "male",
    groupId: groupIds.medina,
    id: "pl-askhat",
    iin: "840909300618",
    installmentMonths: null,
    installmentPlan: false,
    paidAmount: 2950000,
    paymentCreatedAt: "2026-03-28T16:20:00.000Z",
    paymentMethod: "cash",
    paymentStatus: "paid",
    phone: "+7 747 619 70 14",
    qrCode: "QR-HJ-2026-ASKHAT-M1",
    status: "ready",
    totalAmount: 2950000,
  },
  {
    contractGeneratedAt: "2026-03-01T09:25:00.000Z",
    contractUrl: "/demo/contracts/dinara-asylova.pdf",
    createdAt: "2026-02-26T09:00:00.000Z",
    dateOfBirth: "1991-03-05",
    docsCount: 5,
    fullName: "Динара Асылова",
    gender: "female",
    groupId: groupIds.astana,
    id: "pl-dinara",
    iin: "910305400712",
    installmentMonths: 12,
    installmentPlan: true,
    paidAmount: 2520000,
    paymentCreatedAt: "2026-04-20T14:22:00.000Z",
    paymentMethod: "kaspi",
    paymentStatus: "paid",
    phone: "+7 709 118 42 66",
    qrCode: "QR-HJ-2026-DINARA-B0",
    status: "ready",
    totalAmount: 2520000,
  },
  {
    contractGeneratedAt: "2026-02-22T10:10:00.000Z",
    contractUrl: "/demo/contracts/gulzhan-serikbay.pdf",
    createdAt: "2026-02-21T09:00:00.000Z",
    dateOfBirth: "1975-03-02",
    docsCount: 5,
    fullName: "Серікбай Гүлжан",
    gender: "female",
    groupId: groupIds.astana,
    id: "pl-gulzhan",
    iin: "750302400589",
    installmentMonths: null,
    installmentPlan: false,
    paidAmount: 3400000,
    paymentCreatedAt: "2026-02-22T10:20:00.000Z",
    paymentMethod: "transfer",
    paymentStatus: "paid",
    phone: "+7 708 415 22 08",
    qrCode: "QR-HJ-2026-GULJAN-B1",
    status: "ready",
    totalAmount: 3400000,
  },
  {
    contractGeneratedAt: "2026-02-25T09:45:00.000Z",
    contractUrl: "/demo/contracts/abdirakhman-nurlan.pdf",
    createdAt: "2026-02-22T09:00:00.000Z",
    dateOfBirth: "1979-05-30",
    docsCount: 5,
    fullName: "Әбдірахман Нұрлан",
    gender: "male",
    groupId: groupIds.ramadan,
    id: "pl-abdirakhman",
    iin: "790530400178",
    installmentMonths: null,
    installmentPlan: false,
    paidAmount: 2850000,
    paymentCreatedAt: "2026-02-25T09:50:00.000Z",
    paymentMethod: "kaspi",
    paymentStatus: "paid",
    phone: "+7 775 333 11 09",
    qrCode: "QR-HJ-2026-NURLAN-A7",
    status: "ready",
    totalAmount: 2850000,
  },
  {
    contractGeneratedAt: "2026-03-01T11:10:00.000Z",
    contractUrl: "/demo/contracts/temirbayeva-dinara.pdf",
    createdAt: "2026-02-25T09:00:00.000Z",
    dateOfBirth: "1983-01-15",
    docsCount: 1,
    fullName: "Темірбаева Динара",
    gender: "female",
    groupId: groupIds.astana,
    id: "pl-temirbayeva-dinara",
    iin: "830115400912",
    installmentMonths: 10,
    installmentPlan: true,
    paidAmount: 900000,
    paymentCreatedAt: "2026-03-01T11:00:00.000Z",
    paymentMethod: "halyk",
    paymentStatus: "partial",
    phone: "+7 702 655 19 84",
    qrCode: "QR-HJ-2026-DINARA-B2",
    status: "docs_pending",
    totalAmount: 3200000,
  },
  {
    contractGeneratedAt: null,
    contractUrl: null,
    createdAt: "2026-02-27T09:00:00.000Z",
    dateOfBirth: "1985-10-20",
    docsCount: 4,
    fullName: "Бекетов Тимур",
    gender: "male",
    groupId: groupIds.astana,
    id: "pl-beketov-timur",
    iin: "851020300456",
    installmentMonths: 8,
    installmentPlan: true,
    paidAmount: 1600000,
    paymentCreatedAt: "2026-03-05T11:00:00.000Z",
    paymentMethod: "kaspi",
    paymentStatus: "partial",
    phone: "+7 701 988 44 22",
    qrCode: "QR-HJ-2026-TIMUR-B3",
    status: "payment_partial",
    totalAmount: 3200000,
  },
];

const generatedPilgrimNames = [
  "Кенжебеков Нұрбол",
  "Алмагүл Сейтова",
  "Рүстем Қайратов",
  "Малика Сакенова",
  "Диас Нұрпейісов",
  "Гаухар Төлеубаева",
  "Айдын Әбдірахманов",
  "Айжан Омарова",
  "Қуанышбек Сапаров",
  "Мадина Есимова",
  "Ермек Калиев",
  "Зарина Тұрсын",
  "Дәурен Мұқанов",
  "Ғалия Нұрқаділова",
  "Әділет Асанов",
  "Гүлмира Әбенова",
  "Санжар Бекмұратов",
  "Әсел Құдайберген",
  "Данияр Тлепов",
  "Меруерт Әбілқасым",
  "Нұртас Сәрсенбай",
  "Кәрима Аманжол",
  "Елдар Өтепов",
  "Айнұр Бектас",
  "Мирас Оразбай",
  "Салтанат Ермек",
  "Олжас Қарибай",
  "Индира Сағатова",
  "Азамат Дүкенов",
  "Арайлым Сапарбек",
  "Талғат Нұрбай",
  "Амина Байғазы",
  "Арман Қасенов",
  "Әлия Серикова",
  "Мұрат Есен",
];

const generatedPilgrimSeeds: PilgrimSeed[] = generatedPilgrimNames.map((fullName, index) => {
  const gender = index % 2 === 0 ? "male" : "female";
  const birthDate = makeGeneratedBirthDate(index);
  const docsPattern = [5, 4, 3, 2, 1, 4, 5];
  const docsCount = docsPattern[index % docsPattern.length];
  const groupCycle = [groupIds.ramadan, groupIds.astana, groupIds.medina];
  return {
    createdAt: `2026-03-${String((index % 24) + 1).padStart(2, "0")}T09:00:00.000Z`,
    dateOfBirth: birthDate,
    docsCount,
    fullName,
    gender,
    groupId: groupCycle[index % groupCycle.length],
    id: `pl-${slugifyId(fullName)}`,
    iin: makeGeneratedIin(index + 20, birthDate, gender),
    phone: makeGeneratedPhone(index),
    status: inferGeneratedStatus(docsCount),
  };
});

const pilgrimSeeds = [...manualPilgrimSeeds, ...generatedPilgrimSeeds];

export const pilgrims: PilgrimProfile[] = pilgrimSeeds.map((seed) => ({
  createdAt: seed.createdAt,
  dateOfBirth: seed.dateOfBirth,
  fullName: seed.fullName,
  gender: seed.gender,
  id: seed.id,
  iin: seed.iin,
  operatorId: "op-al-safa",
  phone: seed.phone,
  status: seed.status,
  userId: `user-${seed.id}`,
}));

function getDocumentTypesForSeed(seed: PilgrimSeed) {
  if (seed.id === "pl-erlan") {
    return ["passport", "medical_certificate", "photo", "questionnaire"] as const;
  }
  return requiredDocumentTypes.slice(0, seed.docsCount);
}

export const documents: DocumentRecord[] = pilgrimSeeds.flatMap((seed, seedIndex) =>
  getDocumentTypesForSeed(seed).map((type, docIndex) => {
    const fileBase = `${slugifyId(seed.fullName)}-${type}`;
    return {
      fileName: `${fileBase}.${type === "photo" ? "jpg" : "pdf"}`,
      fileUrl: `/demo/${fileBase}.${type === "photo" ? "jpg" : "pdf"}`,
      id: `doc-${seed.id}-${type}`,
      isVerified: docIndex < Math.max(seed.docsCount - 1, 1),
      pilgrimId: seed.id,
      type,
      uploadedAt: `2026-03-${String(((seedIndex + docIndex) % 28) + 1).padStart(2, "0")}T12:00:00.000Z`,
    };
  }),
);

export const pilgrimGroups: PilgrimGroupRecord[] = pilgrimSeeds.map((seed, index) => ({
  groupId: seed.groupId,
  joinedAt: `2026-03-${String((index % 25) + 1).padStart(2, "0")}T12:00:00.000Z`,
  pilgrimId: seed.id,
}));

export const payments: PaymentRecord[] = pilgrimSeeds
  .filter((seed): seed is PilgrimSeed & Required<Pick<PilgrimSeed, "paidAmount" | "paymentCreatedAt" | "paymentMethod" | "paymentStatus" | "totalAmount">> => {
    return (
      typeof seed.paidAmount === "number" &&
      typeof seed.paymentCreatedAt === "string" &&
      typeof seed.paymentMethod === "string" &&
      typeof seed.paymentStatus === "string" &&
      typeof seed.totalAmount === "number"
    );
  })
  .map((seed) => ({
    contractGeneratedAt: seed.contractGeneratedAt ?? null,
    contractUrl: seed.contractUrl ?? null,
    createdAt: seed.paymentCreatedAt,
    id: `pay-${seed.id}`,
    installmentMonths: seed.installmentMonths ?? null,
    installmentPlan: seed.installmentPlan ?? false,
    operatorId: "op-al-safa",
    paidAmount: seed.paidAmount,
    paymentMethod: seed.paymentMethod,
    pilgrimId: seed.id,
    qrCode: seed.qrCode ?? null,
    status: seed.paymentStatus,
    totalAmount: seed.totalAmount,
  }));

export const reviews: OperatorReview[] = [
  {
    comment: "Құжат жүктеу жеңіл болды, куратор әр қадамды түсіндіріп отырды. Әкемнің сапары алаңсыз өтті.",
    createdAt: "2026-03-28T09:00:00.000Z",
    id: "review-aigul",
    isVisible: true,
    operatorId: "op-al-safa",
    pilgrimId: "pl-aigerim",
    rating: 5,
  },
  {
    comment: "Понравилась прозрачная оплата и то, что договор с QR пришёл в тот же день.",
    createdAt: "2026-03-24T09:00:00.000Z",
    id: "review-erlan",
    isVisible: true,
    operatorId: "op-al-safa",
    pilgrimId: "pl-erlan",
    rating: 5,
  },
  {
    comment: "Куратор напоминал по документам вовремя, но хотелось бы быстрее проверку сертификата.",
    createdAt: "2026-03-18T09:00:00.000Z",
    id: "review-marat",
    isVisible: true,
    operatorId: "op-al-safa",
    pilgrimId: "pl-marat",
    rating: 4,
  },
];

export const notifications: NotificationRecord[] = [
  {
    channel: "whatsapp",
    id: "not-erlan-docs",
    message: "Осталось 5 дней до дедлайна ACWY. Записаться в МЦ Инвитро?",
    operatorId: "op-al-safa",
    pilgrimId: "pl-erlan",
    scheduledAt: "2026-04-20T09:00:00.000Z",
    sentAt: "2026-04-20T09:02:00.000Z",
    status: "sent",
    type: "reminder_docs",
  },
  {
    channel: "in_app",
    id: "not-erlan-flight",
    message: "Групповая встреча по вылету назначена на 25 апреля, 19:00. Подтвердите участие в чате.",
    operatorId: "op-al-safa",
    pilgrimId: "pl-erlan",
    scheduledAt: "2026-04-21T09:00:00.000Z",
    sentAt: null,
    status: "queued",
    type: "reminder_flight",
  },
  {
    channel: "in_app",
    id: "not-aigul-welcome",
    message: "Добро пожаловать в Астана-Премиум. Первый шаг — загрузить паспорт.",
    operatorId: "op-al-safa",
    pilgrimId: "pl-aigerim",
    scheduledAt: "2026-03-01T10:00:00.000Z",
    sentAt: "2026-03-01T10:00:01.000Z",
    status: "sent",
    type: "welcome",
  },
  {
    channel: "whatsapp",
    id: "not-marat-payment",
    message: "Остаток по оплате 1 710 000 ₸. Закройте второй взнос до 25 апреля.",
    operatorId: "op-al-safa",
    pilgrimId: "pl-marat",
    scheduledAt: "2026-04-18T09:00:00.000Z",
    sentAt: null,
    status: "queued",
    type: "reminder_payment",
  },
  {
    channel: "whatsapp",
    id: "not-dinara-checklist",
    message: "Группа вылетает через 14 дней. Проверьте чек-лист и распечатайте договор.",
    operatorId: "op-al-safa",
    pilgrimId: "pl-dinara",
    scheduledAt: "2026-04-15T09:00:00.000Z",
    sentAt: "2026-04-15T09:01:00.000Z",
    status: "sent",
    type: "checklist",
  },
];

export const checklistItems: ChecklistItem[] = [
  {
    category: "documents",
    id: "check-erlan-passport",
    isChecked: true,
    itemName: "Проверить оригинал паспорта",
    pilgrimId: "pl-erlan",
  },
  {
    category: "documents",
    id: "check-erlan-medical",
    isChecked: true,
    itemName: "Справка 086/у с печатью поликлиники",
    pilgrimId: "pl-erlan",
  },
  {
    category: "documents",
    id: "check-erlan-photo",
    isChecked: true,
    itemName: "Фото 4×6 на белом фоне",
    pilgrimId: "pl-erlan",
  },
  {
    category: "documents",
    id: "check-erlan-questionnaire",
    isChecked: true,
    itemName: "Анкета паломника для визы КСА",
    pilgrimId: "pl-erlan",
  },
  {
    category: "documents",
    id: "check-erlan-marriage",
    isChecked: true,
    itemName: "Свидетельство о браке для семейной визы",
    pilgrimId: "pl-erlan",
  },
  {
    category: "health",
    id: "check-erlan-acwy",
    isChecked: false,
    itemName: "Получить сертификат ACWY и загрузить PDF",
    pilgrimId: "pl-erlan",
  },
  {
    category: "health",
    id: "check-erlan-flu",
    isChecked: true,
    itemName: "Прививка от гриппа",
    pilgrimId: "pl-erlan",
  },
  {
    category: "health",
    id: "check-erlan-insurance",
    isChecked: false,
    itemName: "Страховка хадж-мед на весь период поездки",
    pilgrimId: "pl-erlan",
  },
  {
    category: "health",
    id: "check-erlan-first-aid",
    isChecked: false,
    itemName: "Собрать аптечку и хронические лекарства",
    pilgrimId: "pl-erlan",
  },
  {
    category: "health",
    id: "check-erlan-hypertension",
    isChecked: false,
    itemName: "Справка кардиолога по гипертонии",
    pilgrimId: "pl-erlan",
  },
  {
    category: "health",
    id: "check-erlan-water",
    isChecked: true,
    itemName: "Солевые растворы и рекомендации по жаре",
    pilgrimId: "pl-erlan",
  },
  {
    category: "clothing",
    id: "check-erlan-ihram",
    isChecked: true,
    itemName: "Комплект ихрама в ручную кладь",
    pilgrimId: "pl-erlan",
  },
  {
    category: "clothing",
    id: "check-erlan-sandals",
    isChecked: true,
    itemName: "Лёгкие сандалии для тавафа",
    pilgrimId: "pl-erlan",
  },
  {
    category: "clothing",
    id: "check-erlan-bag",
    isChecked: true,
    itemName: "Небольшая сумка через плечо",
    pilgrimId: "pl-erlan",
  },
  {
    category: "clothing",
    id: "check-erlan-socks",
    isChecked: true,
    itemName: "Хлопковые носки и сменное бельё",
    pilgrimId: "pl-erlan",
  },
  {
    category: "clothing",
    id: "check-erlan-towel",
    isChecked: true,
    itemName: "Дорожное полотенце и тапочки для душа",
    pilgrimId: "pl-erlan",
  },
  {
    category: "clothing",
    id: "check-erlan-belt",
    isChecked: true,
    itemName: "Пояс для документов под ихрам",
    pilgrimId: "pl-erlan",
  },
  {
    category: "clothing",
    id: "check-erlan-cap",
    isChecked: false,
    itemName: "Кепка и очки от солнца",
    pilgrimId: "pl-erlan",
  },
  {
    category: "clothing",
    id: "check-erlan-sneakers",
    isChecked: false,
    itemName: "Удобные кроссовки для Медины",
    pilgrimId: "pl-erlan",
  },
  {
    category: "clothing",
    id: "check-erlan-pajamas",
    isChecked: false,
    itemName: "Лёгкая домашняя одежда в отель",
    pilgrimId: "pl-erlan",
  },
  {
    category: "clothing",
    id: "check-erlan-laundry",
    isChecked: false,
    itemName: "Пакеты для белья и стирки",
    pilgrimId: "pl-erlan",
  },
  {
    category: "finance",
    id: "check-erlan-balance",
    isChecked: true,
    itemName: "Закрыть второй платёж по договору",
    pilgrimId: "pl-erlan",
  },
  {
    category: "finance",
    id: "check-erlan-cash",
    isChecked: true,
    itemName: "Подготовить наличные на личные расходы",
    pilgrimId: "pl-erlan",
  },
  {
    category: "finance",
    id: "check-erlan-card",
    isChecked: true,
    itemName: "Проверить лимиты по карте Kaspi",
    pilgrimId: "pl-erlan",
  },
  {
    category: "finance",
    id: "check-erlan-sar",
    isChecked: false,
    itemName: "Купить 500 SAR наличными до вылета",
    pilgrimId: "pl-erlan",
  },
  {
    category: "finance",
    id: "check-erlan-wallet",
    isChecked: false,
    itemName: "Добавить резервную карту в телефон",
    pilgrimId: "pl-erlan",
  },
  {
    category: "finance",
    id: "check-erlan-family",
    isChecked: false,
    itemName: "Оставить семье копии договора и билетов",
    pilgrimId: "pl-erlan",
  },
  {
    category: "spiritual",
    id: "check-erlan-dua",
    isChecked: true,
    itemName: "Сохранить аудио-дуа и заметки",
    pilgrimId: "pl-erlan",
  },
  {
    category: "spiritual",
    id: "check-erlan-niyyah",
    isChecked: true,
    itemName: "Повторить намерение и порядок умры",
    pilgrimId: "pl-erlan",
  },
  {
    category: "spiritual",
    id: "check-erlan-book",
    isChecked: false,
    itemName: "Взять маленький сборник дуа",
    pilgrimId: "pl-erlan",
  },
  {
    category: "spiritual",
    id: "check-erlan-memo",
    isChecked: false,
    itemName: "Записать список людей для дуа",
    pilgrimId: "pl-erlan",
  },
  {
    category: "spiritual",
    id: "check-erlan-lecture",
    isChecked: false,
    itemName: "Посмотреть лекцию по обрядам хаджа",
    pilgrimId: "pl-erlan",
  },
  {
    category: "spiritual",
    id: "check-erlan-zikr",
    isChecked: false,
    itemName: "Подготовить тасбих и счётчик зикра",
    pilgrimId: "pl-erlan",
  },
  {
    category: "spiritual",
    id: "check-erlan-friday",
    isChecked: false,
    itemName: "Запланировать садака до вылета",
    pilgrimId: "pl-erlan",
  },
];

export const timelineEvents: TimelineEvent[] = [
  {
    detail: "QR · QR-HJ-2026-ERLAN-A4",
    id: "timeline-erlan-contract",
    pilgrimId: "pl-erlan",
    timestamp: "2026-03-12T14:32:00.000Z",
    title: "Договор подписан",
  },
  {
    detail: "1 995 000 ₸ через Kaspi",
    id: "timeline-erlan-payment",
    pilgrimId: "pl-erlan",
    timestamp: "2026-03-12T14:15:00.000Z",
    title: "Платёж получен",
  },
  {
    detail: "Астана-Премиум",
    id: "timeline-aigul-group",
    pilgrimId: "pl-aigerim",
    timestamp: "2026-03-10T12:00:00.000Z",
    title: "Назначена в группу",
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
    docsCount,
    isInGroup,
    isPaymentComplete,
    isReady: docsCount === requiredDocumentTypes.length && isPaymentComplete && isInGroup,
    pilgrimId,
    readinessPercent,
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
    operator,
    payment,
    pilgrim,
  };
}
