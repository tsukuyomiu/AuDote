export function isEmail(value: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()); }
export function isBrazilPhone(value: string) { const digits = value.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, ''); return /^\d{10,11}$/.test(digits) && !/^0/.test(digits); }
export function validatePassword(password: string, confirmation?: string) { if (password.length < 8) return 'A senha deve ter pelo menos 8 caracteres.'; if (confirmation !== undefined && confirmation !== password) return 'As senhas precisam ser iguais.'; return ''; }

/** Formata enquanto o usuário digita: (61) 9999-9999 ou (61) 99999-9999. */
export function formatPhone(value: string) {
  let digits = value.replace(/\D/g, '');
  if (digits.length > 11 && digits.startsWith('55')) digits = digits.slice(2);
  digits = digits.slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  const area = digits.slice(0, 2);
  const rest = digits.slice(2);
  if (rest.length <= 4) return `(${area}) ${rest}`;
  const split = digits.length > 10 ? 5 : 4;
  return `(${area}) ${rest.slice(0, split)}-${rest.slice(split)}`;
}
