/**
 * Field-level validation helpers
 *
 * These validators can be composed together to create complex validation rules.
 */

import { cleanDigits, isValidEmail } from '../utils/regex';

export const validators = {
  required:
    (message = 'Campo obrigatório') =>
    <T>(value: T): string | undefined =>
      !value ? message : undefined,

  email:
    (message = 'Email inválido') =>
    (value: string): string | undefined =>
      !isValidEmail(value) ? message : undefined,

  minLength: (min: number, message?: string) => (value: string): string | undefined =>
    value.length < min ? message || `Mínimo ${min} caracteres` : undefined,

  maxLength: (max: number, message?: string) => (value: string): string | undefined =>
    value.length > max ? message || `Máximo ${max} caracteres` : undefined,

  pattern:
    (regex: RegExp, message = 'Formato inválido') =>
    (value: string): string | undefined =>
      !regex.test(value) ? message : undefined,

  cpf:
    (message = 'CPF inválido') =>
    (value: string): string | undefined => {
      const cleaned = cleanDigits(value);
      return cleaned.length !== 11 ? message : undefined;
    },

  phone:
    (message = 'Telefone inválido') =>
    (value: string): string | undefined => {
      const cleaned = cleanDigits(value);
      return cleaned.length < 10 || cleaned.length > 11 ? message : undefined;
    },
};
