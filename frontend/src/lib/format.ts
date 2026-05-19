export function formatCompactNumber(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "N/A";
  }

  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value?: number | null, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "N/A";
  }

  return new Intl.NumberFormat("en", {
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatCurrency(
  value?: number | null,
  currency = "USD"
) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "N/A";
  }

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "N/A";
  }

  return `${(value * 100).toFixed(2)}%`;
}

export function formatDateLabel(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en", {
    month: "short",
    day: "numeric",
  });
}