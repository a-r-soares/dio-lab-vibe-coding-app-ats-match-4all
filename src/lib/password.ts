/** Política de senha forte — validação compartilhada (front e servidor). */

export interface PasswordCheck {
  id: string;
  label: string;
  ok: boolean;
}

const COMMON_PASSWORDS = [
  "123456", "12345678", "123456789", "12345678910", "senha123", "senha",
  "password", "password1", "qwerty", "qwerty123", "brasil123", "brasil",
  "admin", "admin123", "abc123", "iloveyou", "111111", "000000",
  "letmein", "welcome", "mudar123", "futebol", "flamengo",
];

function hasSequence(pw: string): boolean {
  const lower = pw.toLowerCase();
  const seqs = "abcdefghijklmnopqrstuvwxyz";
  for (let i = 0; i < lower.length - 3; i++) {
    const chunk = lower.slice(i, i + 4);
    if (seqs.includes(chunk) || seqs.split("").reverse().join("").includes(chunk)) return true;
    if (/^\d{4}$/.test(chunk)) {
      const digits = chunk.split("").map(Number);
      const asc = digits.every((d, j) => j === 0 || d === digits[j - 1]! + 1);
      const desc = digits.every((d, j) => j === 0 || d === digits[j - 1]! - 1);
      if (asc || desc) return true;
    }
  }
  return false;
}

function hasRepetition(pw: string): boolean {
  return /(.)\1{3,}/.test(pw);
}

export function checkPassword(
  password: string,
  context?: { email?: string | undefined; name?: string | undefined },
): PasswordCheck[] {
  const checks: PasswordCheck[] = [
    { id: "len", label: "Pelo menos 10 caracteres", ok: password.length >= 10 },
    { id: "upper", label: "Uma letra maiúscula", ok: /[A-Z]/.test(password) },
    { id: "lower", label: "Uma letra minúscula", ok: /[a-z]/.test(password) },
    { id: "digit", label: "Um número", ok: /\d/.test(password) },
    { id: "symbol", label: "Um símbolo (ex.: !@#$%)", ok: /[^A-Za-z0-9]/.test(password) },
  ];

  const lower = password.toLowerCase();
  const alnum = lower.replace(/[^a-z0-9]/g, "");
  const isCommon =
    COMMON_PASSWORDS.some((c) => lower === c || alnum === c.replace(/[^a-z0-9]/g, "")) ||
    hasSequence(password) ||
    hasRepetition(password);
  checks.push({ id: "common", label: "Não é uma senha comum, sequência ou repetição", ok: password.length > 0 && !isCommon });

  let containsPersonal = false;
  if (context?.email) {
    const local = context.email.split("@")[0]?.toLowerCase() ?? "";
    if (local.length >= 3 && lower.includes(local)) containsPersonal = true;
  }
  if (context?.name) {
    for (const part of context.name.toLowerCase().split(/\s+/)) {
      if (part.length >= 3 && lower.includes(part)) containsPersonal = true;
    }
  }
  checks.push({ id: "personal", label: "Não contém seu nome ou e-mail", ok: password.length > 0 && !containsPersonal });

  return checks;
}

export function isPasswordStrong(
  password: string,
  context?: { email?: string | undefined; name?: string | undefined },
): boolean {
  return checkPassword(password, context).every((c) => c.ok);
}

export function passwordStrengthScore(
  password: string,
  context?: { email?: string | undefined; name?: string | undefined },
): number {
  const checks = checkPassword(password, context);
  return checks.filter((c) => c.ok).length / checks.length;
}
