const kztFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 0,
});

const ruDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatKzt(amount: number) {
  return `${kztFormatter.format(amount)} ₸`;
}

export function formatDate(date: string) {
  return ruDateFormatter.format(new Date(date));
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export function initials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .slice(0, 2)
    .join("");
}
