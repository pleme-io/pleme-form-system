/**
 * Generic Validation Functions
 *
 * Reusable validators for common patterns (email, URL, length, dates, etc.)
 */

/**
 * Email validation regex (RFC 5322 simplified)
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate email address
 * @param email - Email address to validate
 * @returns true if valid email format
 * @example
 * validateEmail("user@example.com") // true
 * validateEmail("invalid.email") // false
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Validate URL
 * @param url - URL string to validate
 * @returns true if valid URL
 * @example
 * validateURL("https://example.com") // true
 * validateURL("not-a-url") // false
 */
export function validateURL(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate minimum length
 * @param value - String to validate
 * @param min - Minimum length required
 * @returns true if length >= min
 * @example
 * validateMinLength("hello", 3) // true
 * validateMinLength("hi", 5) // false
 */
export function validateMinLength(value: string, min: number): boolean {
  if (typeof value !== 'string') {
    return false;
  }
  return value.length >= min;
}

/**
 * Validate maximum length
 * @param value - String to validate
 * @param max - Maximum length allowed
 * @returns true if length <= max
 * @example
 * validateMaxLength("hello", 10) // true
 * validateMaxLength("hello world", 5) // false
 */
export function validateMaxLength(value: string, max: number): boolean {
  if (typeof value !== 'string') {
    return false;
  }
  return value.length <= max;
}

/**
 * Validate positive integer
 * @param value - Number or numeric string to validate
 * @returns true if positive integer
 * @example
 * validatePositiveInteger(5) // true
 * validatePositiveInteger("10") // true
 * validatePositiveInteger(-1) // false
 * validatePositiveInteger(3.14) // false
 */
export function validatePositiveInteger(value: string | number): boolean {
  const num = typeof value === 'string' ? parseInt(value, 10) : value;
  return Number.isInteger(num) && num > 0;
}

/**
 * Validate price (positive number with up to 2 decimal places)
 * @param value - Number or numeric string to validate
 * @returns true if valid price
 * @example
 * validatePrice(10.99) // true
 * validatePrice("5.5") // true
 * validatePrice(-1) // false
 * validatePrice(10.999) // false (too many decimals)
 */
export function validatePrice(value: string | number): boolean {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (Number.isNaN(num) || num < 0) {
    return false;
  }

  // Check decimal places (max 2)
  const parts = num.toString().split('.');
  if (parts.length > 1 && parts[1].length > 2) {
    return false;
  }

  return true;
}

/**
 * Validate date is in future
 * @param date - Date object or ISO string
 * @returns true if date is after current time
 * @example
 * validateFutureDate(new Date("2030-01-01")) // true
 * validateFutureDate(new Date("2020-01-01")) // false
 */
export function validateFutureDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return false;
  }
  return dateObj > new Date();
}

/**
 * Validate date is in past
 * @param date - Date object or ISO string
 * @returns true if date is before current time
 * @example
 * validatePastDate(new Date("2020-01-01")) // true
 * validatePastDate(new Date("2030-01-01")) // false
 */
export function validatePastDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return false;
  }
  return dateObj < new Date();
}

/**
 * Validate age (minimum age requirement from birth date)
 * @param birthDate - Birth date as Date object or ISO string
 * @param minAge - Minimum age required
 * @returns true if age >= minAge
 * @example
 * validateAge("2000-01-01", 18) // true (if person is 18+)
 * validateAge("2010-01-01", 18) // false (person is under 18)
 */
export function validateAge(birthDate: string | Date, minAge: number): boolean {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  if (!(birth instanceof Date) || isNaN(birth.getTime())) {
    return false;
  }

  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  // Adjust age if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1 >= minAge;
  }

  return age >= minAge;
}

/**
 * Validate that value matches a regex pattern
 * @param value - String to validate
 * @param pattern - RegExp pattern to match
 * @returns true if value matches pattern
 * @example
 * validatePattern("ABC123", /^[A-Z]+\d+$/) // true
 * validatePattern("abc123", /^[A-Z]+\d+$/) // false
 */
export function validatePattern(value: string, pattern: RegExp): boolean {
  if (typeof value !== 'string') {
    return false;
  }
  return pattern.test(value);
}

/**
 * Validate that value is one of allowed options
 * @param value - Value to check
 * @param options - Array of allowed values
 * @returns true if value is in options
 * @example
 * validateEnum("red", ["red", "green", "blue"]) // true
 * validateEnum("yellow", ["red", "green", "blue"]) // false
 */
export function validateEnum<T>(value: T, options: readonly T[]): boolean {
  return options.includes(value);
}
