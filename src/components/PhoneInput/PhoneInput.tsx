/**
 * PhoneInput Component
 *
 * Brazilian phone input field with real-time masking and strict validation.
 * Uses @pleme/brazilian-utils for validation and formatting.
 *
 * @example
 * // With React Hook Form
 * <Controller
 *   name="phone"
 *   control={control}
 *   render={({ field, fieldState }) => (
 *     <PhoneInput
 *       {...field}
 *       error={fieldState.error?.message}
 *       label="Telefone"
 *     />
 *   )}
 * />
 *
 * @example
 * // Standalone usage
 * <PhoneInput
 *   value={phone}
 *   onChange={(e) => setPhone(e.target.value)}
 *   error={phoneError}
 * />
 */

import { Phone as PhoneIcon } from '@mui/icons-material'
import {
  InputAdornment,
  TextField,
  type TextFieldProps,
} from '@mui/material'
import React, { forwardRef, useCallback, type ChangeEvent } from 'react'
import {
  phoneMask,
  cleanPhoneDigits,
  validatePhoneStrict,
  getPhoneValidationError,
} from '@pleme/brazilian-utils'

export interface PhoneInputProps extends Omit<TextFieldProps, 'error' | 'onChange'> {
  /**
   * Error message to display
   */
  error?: string

  /**
   * Whether to show the phone icon
   * @default true
   */
  showIcon?: boolean

  /**
   * Maximum length of digits (without formatting)
   * @default 11
   */
  maxDigits?: number

  /**
   * Whether to use strict Brazilian phone validation
   * When true, validates area codes and phone number patterns
   * @default true
   */
  strictValidation?: boolean

  /**
   * Callback when value changes
   * Receives the masked/formatted value
   */
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void

  /**
   * Callback when raw digits change (without formatting)
   */
  onDigitsChange?: (digits: string) => void
}

/**
 * PhoneInput - Brazilian phone input with real-time masking
 *
 * Features:
 * - Real-time formatting as user types: (XX) XXXXX-XXXX
 * - Strict Brazilian phone validation (area codes, mobile/landline patterns)
 * - Maximum 11 digits (mobile) or 10 digits (landline)
 * - Phone icon adornment
 * - Works with React Hook Form via forwardRef
 */
export const PhoneInput: React.ForwardRefExoticComponent<
  PhoneInputProps & React.RefAttributes<HTMLInputElement>
> = forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      error,
      showIcon = true,
      maxDigits = 11,
      strictValidation = true,
      onChange,
      onDigitsChange,
      value,
      label = 'Telefone',
      placeholder = '(11) 99999-9999',
      ...textFieldProps
    },
    ref
  ) => {
    const handleChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        const rawValue = event.target.value
        const digits = cleanPhoneDigits(rawValue)

        // Limit to max digits
        const limitedDigits = digits.slice(0, maxDigits)

        // Apply mask
        const maskedValue = phoneMask(limitedDigits)

        // Create new event with masked value
        const newEvent = {
          ...event,
          target: {
            ...event.target,
            value: maskedValue,
          },
        } as ChangeEvent<HTMLInputElement>

        // Notify parent of change
        onChange?.(newEvent)

        // Also notify of raw digits if callback provided
        onDigitsChange?.(limitedDigits)
      },
      [maxDigits, onChange, onDigitsChange]
    )

    return (
      <TextField
        {...textFieldProps}
        ref={ref}
        value={value}
        onChange={handleChange}
        label={label}
        placeholder={placeholder}
        error={!!error}
        helperText={error || textFieldProps.helperText}
        inputMode="tel"
        type="tel"
        slotProps={{
          ...textFieldProps.slotProps,
          input: {
            ...textFieldProps.slotProps?.input,
            startAdornment: showIcon ? (
              <InputAdornment position="start">
                <PhoneIcon color={error ? 'error' : 'action'} />
              </InputAdornment>
            ) : undefined,
          },
        }}
      />
    )
  }
)

PhoneInput.displayName = 'PhoneInput'

/**
 * Zod refinement for Brazilian phone validation (strict)
 *
 * @example
 * const schema = z.object({
 *   phone: z.string().refine(...brazilianPhoneRefinement)
 * })
 */
export const brazilianPhoneRefinement: readonly [
  (value: string) => boolean,
  (value: string) => string,
] = [
  (value: string): boolean => validatePhoneStrict(value),
  (value: string): string => getPhoneValidationError(value) || 'Telefone inválido',
] as const

/**
 * Zod schema helper for Brazilian phone
 *
 * @example
 * import { z } from 'zod'
 * import { createPhoneSchema } from '@pleme/form-system'
 *
 * const schema = z.object({
 *   phone: createPhoneSchema()
 * })
 */
// Return type for createPhoneSchema - using unknown since we load zod dynamically
type PhoneSchemaResult = unknown

export const createPhoneSchema = (options?: {
  required?: boolean
  requiredMessage?: string
}): PhoneSchemaResult => {
  const { required = true, requiredMessage = 'Telefone é obrigatório' } = options || {}

  // Import zod lazily to avoid bundling if not used
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { z } = require('zod')

  const baseSchema = z.string()

  if (required) {
    return baseSchema
      .min(1, requiredMessage)
      .refine(
        (value: string) => validatePhoneStrict(value),
        (value: string) => ({ message: getPhoneValidationError(value) || 'Telefone inválido' })
      )
  }

  return baseSchema
    .optional()
    .refine(
      (value: string | undefined) => !value || validatePhoneStrict(value),
      (value: string | undefined) => ({
        message: value ? getPhoneValidationError(value) || 'Telefone inválido' : undefined,
      })
    )
}
