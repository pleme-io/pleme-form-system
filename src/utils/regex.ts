/**
 * Regex Utilities
 *
 * Regular expression patterns and utilities for validation
 */

/**
 * CEP (Brazilian ZIP code) patterns
 */
export const CEP_PATTERNS: {
  readonly BASIC: RegExp
  readonly STRICT: RegExp
  readonly WITH_DASH: RegExp
} = {
  BASIC: /^\d{5}-?\d{3}$/,
  STRICT: /^\d{8}$/,
  WITH_DASH: /^\d{5}-\d{3}$/,
}

/**
 * CPF patterns
 */
export const CPF_PATTERNS: {
  readonly BASIC: RegExp
  readonly STRICT: RegExp
  readonly FORMATTED: RegExp
} = {
  BASIC: /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/,
  STRICT: /^\d{11}$/,
  FORMATTED: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
}

/**
 * Phone patterns
 */
export const PHONE_PATTERNS: {
  readonly MOBILE: RegExp
  readonly LANDLINE: RegExp
  readonly WITH_COUNTRY_CODE: RegExp
} = {
  MOBILE: /^(\d{2})\s?9?\d{4}-?\d{4}$/,
  LANDLINE: /^(\d{2})\s?\d{4}-?\d{4}$/,
  WITH_COUNTRY_CODE: /^\+?55\s?(\d{2})\s?9?\d{4}-?\d{4}$/,
}

/**
 * Email pattern
 */
export const EMAIL_PATTERN: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Password patterns
 */
export const PASSWORD_PATTERNS: {
  readonly MIN_LENGTH: RegExp
  readonly HAS_UPPERCASE: RegExp
  readonly HAS_LOWERCASE: RegExp
  readonly HAS_NUMBER: RegExp
  readonly HAS_SPECIAL: RegExp
} = {
  MIN_LENGTH: /.{8,}/,
  HAS_UPPERCASE: /[A-Z]/,
  HAS_LOWERCASE: /[a-z]/,
  HAS_NUMBER: /\d/,
  HAS_SPECIAL: /[!@#$%^&*(),.?":{}|<>]/,
}

/**
 * Formatting patterns
 */
export const FORMATTING_PATTERNS: {
  readonly CEP_FORMAT: RegExp
  readonly CPF_FORMAT: RegExp
  readonly PHONE_FORMAT: RegExp
  readonly CARD_NUMBER: RegExp
} = {
  CEP_FORMAT: /^(\d{5})(\d{3})$/,
  CPF_FORMAT: /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
  PHONE_FORMAT: /^(\d{2})(\d{5})(\d{4})$/,
  CARD_NUMBER: /(\d{4})(?=\d)/g,
}

/**
 * Clean digits from string (remove all non-digit characters)
 */
export function cleanDigits(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Validates email using the standard pattern
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email)
}

/**
 * Create URL-friendly slug from string
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
