const HIJRI_MONTHS_RU = [
  "Мухаррам",
  "Сафар",
  "Раби аль-авваль",
  "Раби ас-сани",
  "Джумада аль-уля",
  "Джумада ас-сания",
  "Раджаб",
  "Шаабан",
  "Рамадан",
  "Шавваль",
  "Зуль-каада",
  "Зуль-хиджа",
] as const;

function getIslamicDateParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-u-ca-islamic", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    timeZone,
  }).formatToParts(date);

  const getPart = (type: "day" | "month" | "year") => {
    const value = parts.find((part) => part.type === type)?.value;
    return value ? Number.parseInt(value, 10) : Number.NaN;
  };

  return {
    day: getPart("day"),
    month: getPart("month"),
    year: getPart("year"),
  };
}

export function formatHijriDate(date = new Date(), timeZone = "Asia/Almaty") {
  const { day, month, year } = getIslamicDateParts(date, timeZone);

  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year) || month < 1 || month > 12) {
    return "";
  }

  return `${day} ${HIJRI_MONTHS_RU[month - 1]} ${year}`;
}
