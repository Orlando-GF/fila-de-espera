export function capitalizeWords(value: string) {
  return value
    .replace(/\s+/g, " ")
    .toLocaleUpperCase("pt-BR");
}

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function stripDigits(value: string) {
  return value.replace(/\d/g, "");
}

export function formatPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
