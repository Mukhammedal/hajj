import type { Operator } from "@/types/domain";
import { slugify } from "@/lib/utils";

type PublicOperatorCardSource = {
  city: string;
  operator: Operator;
  quotaLeft: number;
};

export interface ShowcaseOperator {
  addressLine: string;
  badge: string;
  city: string;
  companyName: string;
  href: string;
  image: string;
  licenseNumber: string;
  priceFrom: number;
  quotaLeft: number;
  quotaTotal: number;
  rating: number;
  reviews: number;
  slug: string;
  tags: string[];
}

const image = (assetId: string, width = 1400) =>
  `https://images.unsplash.com/${assetId}?auto=format&fit=crop&w=${width}&q=80`;

export const designImages = {
  heroKaaba: image("photo-1591604129939-f1efa4d9f7fa", 1600),
  medina: image("photo-1519817650390-64a93db51149", 1600),
  operatorOne: image("photo-1564769625905-50e93615e769", 1200),
  operatorTwo: image("photo-1542816417-0983c9c9ad53", 1200),
  operatorThree: image("photo-1519817650390-64a93db51149", 1200),
  operatorFour: image("photo-1591604129939-f1efa4d9f7fa", 1200),
};

const showcaseSeeds: ShowcaseOperator[] = [
  {
    slug: "al-safa-hajj-travel",
    companyName: "Al-Safa Hajj Travel",
    city: "Алматы",
    addressLine: "Алматы · пр. Абая 150",
    licenseNumber: "KZ-HJ-2026-001",
    rating: 4.8,
    reviews: 128,
    badge: "ДУМК",
    tags: ["Kaspi рассрочка", "Гид KZ/RU", "12 лет"],
    priceFrom: 2850000,
    quotaLeft: 8,
    quotaTotal: 45,
    image: designImages.operatorOne,
    href: "/operators/al-safa-hajj-travel",
  },
  {
    slug: "nur-iman-tours",
    companyName: "Nur Iman Tours",
    city: "Астана",
    addressLine: "Астана · ул. Сарайшык 34",
    licenseNumber: "KZ-HJ-2026-017",
    rating: 4.7,
    reviews: 86,
    badge: "ДУМК",
    tags: ["Медкуратор", "Прямой Saudia", "Умра"],
    priceFrom: 2450000,
    quotaLeft: 12,
    quotaTotal: 40,
    image: designImages.operatorTwo,
    href: "/operators/nur-iman-tours",
  },
  {
    slug: "zamzam-group-kazakhstan",
    companyName: "Zamzam Group Kazakhstan",
    city: "Шымкент",
    addressLine: "Шымкент · Тауке хана 8",
    licenseNumber: "KZ-HJ-2026-024",
    rating: 4.9,
    reviews: 204,
    badge: "Премиум",
    tags: ["≤500 м от Харама", "Премиум", "VIP"],
    priceFrom: 3100000,
    quotaLeft: 3,
    quotaTotal: 30,
    image: designImages.operatorThree,
    href: "/operators/zamzam-group-kazakhstan",
  },
  {
    slug: "baraka-hajj-services",
    companyName: "Baraka Hajj Services",
    city: "Астана",
    addressLine: "Астана · Кунаева 12",
    licenseNumber: "KZ-HJ-2026-033",
    rating: 4.6,
    reviews: 54,
    badge: "ДУМК",
    tags: ["Рассрочка 18 мес", "KZ гид"],
    priceFrom: 2650000,
    quotaLeft: 22,
    quotaTotal: 40,
    image: designImages.operatorFour,
    href: "/operators/baraka-hajj-services",
  },
];

export const alSafaPackageIncludes = [
  "Виза хаджа через ДУМК",
  "Прямой перелёт Saudia эконом",
  "Отель Mövenpick Makkah · 4★",
  "Отель Swissôtel Al Maqam · Медина",
  "Казахоязычный гид (Нұрлан Әбдіғапаров)",
  "Трансферы и группы по 15 человек",
  "Ихрам и питание 3 раза в день",
  "Мед. страховка на 21 день",
];

export const alSafaGroupRows = [
  {
    name: "Рамазан-2026",
    route: "Алматы → Джидда",
    dates: "12.06 — 03.07.2026",
    quotaFilled: 37,
    quotaTotal: 45,
    quotaPercent: 82,
    price: 2850000,
  },
  {
    name: "Медина-Первая",
    route: "Алматы → Медина",
    dates: "14.06 — 05.07.2026",
    quotaFilled: 33,
    quotaTotal: 45,
    quotaPercent: 73,
    price: 2950000,
  },
  {
    name: "Астана-Премиум",
    route: "Астана → Джидда",
    dates: "18.06 — 09.07.2026",
    quotaFilled: 37,
    quotaTotal: 40,
    quotaPercent: 92,
    price: 3150000,
  },
];

export function buildShowcaseOperators(items: PublicOperatorCardSource[] = []) {
  if (!items.length) {
    return showcaseSeeds;
  }

  return items.map((item, index) => {
    const matchedSeed = showcaseSeeds.find((seed) => {
      const companySlug = slugify(item.operator.companyName);
      return companySlug === seed.slug || item.operator.id === seed.slug;
    });
    const fallbackSeed = showcaseSeeds[index % showcaseSeeds.length];
    const seed = matchedSeed ?? fallbackSeed;
    const slug = slugify(item.operator.companyName) || item.operator.id;
    const address = item.operator.address?.trim();
    const city = address?.split(/[·,]/)[0]?.trim() || seed.city;
    const quotaTotal = item.quotaLeft > 0 ? item.quotaLeft + Math.max(Math.round(item.quotaLeft * 2.5), 1) : seed.quotaTotal;

    return {
      ...seed,
      slug,
      href: `/operators/${slug}`,
      addressLine: address
        ? address.includes("·")
          ? address
          : `${city} · ${address.replace(/^.*?,\s*/, "")}`
        : seed.addressLine,
      city,
      companyName: item.operator.companyName,
      licenseNumber: item.operator.licenseNumber,
      quotaLeft: item.quotaLeft,
      quotaTotal,
      rating: item.operator.rating || seed.rating,
      reviews: item.operator.totalReviews || seed.reviews,
      priceFrom: seed.priceFrom,
      image: matchedSeed?.image ?? fallbackSeed.image,
    };
  });
}

export function findShowcaseOperator(slug: string) {
  return showcaseSeeds.find((item) => item.slug === slug);
}
