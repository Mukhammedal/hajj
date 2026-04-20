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
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return date;
  }

  return ruDateFormatter
    .formatToParts(value)
    .filter((part) => !(part.type === "literal" && part.value.trim() === "г."))
    .map((part) => part.value)
    .join("")
    .replace(/\s+г\.?$/, "")
    .trim();
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

export function maskIin(iin: string) {
  const digits = iin.replace(/\D/g, "");

  if (digits.length < 9) {
    return iin;
  }

  return `${digits.slice(0, 6)}•••${digits.slice(-3)}`;
}
