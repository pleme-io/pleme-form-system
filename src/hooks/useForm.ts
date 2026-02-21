/**
 * Form Handling Hook
 *
 * Type-safe form management with validation
 */

import { useMachine } from '@xstate/react'
import { useCallback, useMemo } from 'react'
import { cleanDigits, isValidEmail } from '../utils/regex'
import {
  createFormMachine,
  getFieldError,
  getFormErrors,
  getFormValues,
  isFormDirty,
  isFormSubmitting,
  isFormValid,
} from '../machines/formMachine'

type FormErrors<T> = Partial<Record<keyof T, string>>
type TouchedFields<T> = Partial<Record<keyof T, boolean>>
type FormValidator<T> = (values: T) => FormErrors<T> | Promise<FormErrors<T>>

export interface UseFormOptions<T> {
  initialValues: T
  validate?: FormValidator<T>
  validateOnChange?: boolean
  validateOnBlur?: boolean
  onSubmit?: (values: T) => void | Promise<void>
}

export interface UseFormReturn<T> {
  values: T
  errors: FormErrors<T>
  touched: TouchedFields<T>
  isSubmitting: boolean
  isValid: boolean
  isDirty: boolean
  handleChange: <K extends keyof T>(field: K) => (value: T[K]) => void
  handleBlur: <K extends keyof T>(field: K) => () => void
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void
  setFieldError: <K extends keyof T>(field: K, error: string) => void
  setErrors: (errors: FormErrors<T>) => void
  validateForm: () => Promise<boolean>
  validateField: <K extends keyof T>(field: K) => Promise<boolean>
  handleSubmit: (e?: React.FormEvent) => Promise<void>
  reset: () => void
  resetField: <K extends keyof T>(field: K) => void
}

/**
 * Hook for type-safe form management
 */
export function useForm<T extends Record<string, unknown>>(
  options: UseFormOptions<T>
): UseFormReturn<T> {
  const {
    initialValues,
    validate,
    validateOnChange = true,
    validateOnBlur = true,
    onSubmit,
  } = options

  const machine = useMemo(
    () => createFormMachine(initialValues, validate, validateOnChange, validateOnBlur),
    [initialValues, validate, validateOnChange, validateOnBlur]
  )

  const [state, send] = useMachine(machine)

  // Computed values from state
  const values = getFormValues(state)
  const errors = getFormErrors(state)
  const touched = state.context.touched
  const isSubmitting = isFormSubmitting(state)
  const isValid = isFormValid(state)
  const isDirty = isFormDirty(state)

  // Validate entire form
  const validateForm = useCallback(async (): Promise<boolean> => {
    send({ type: 'VALIDATE_FORM' })
    // Wait for validation to complete
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(isFormValid(state))
      }, 100)
    })
  }, [send, state])

  // Validate single field
  const validateField = useCallback(
    async <K extends keyof T>(field: K): Promise<boolean> => {
      send({ type: 'VALIDATE_FIELD', field })
      // Wait for validation to complete
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(!getFieldError(state, field))
        }, 100)
      })
    },
    [send, state]
  )

  // Handle field change
  const handleChange = useCallback(
    <K extends keyof T>(field: K) => {
      return (value: T[K]) => {
        send({ type: 'CHANGE_FIELD', field, value })
      }
    },
    [send]
  )

  // Handle field blur
  const handleBlur = useCallback(
    <K extends keyof T>(field: K) => {
      return () => {
        send({ type: 'BLUR_FIELD', field })
      }
    },
    [send]
  )

  // Set field value programmatically
  const setFieldValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      send({ type: 'SET_FIELD_VALUE', field, value })
    },
    [send]
  )

  // Set field error
  const setFieldError = useCallback(
    <K extends keyof T>(field: K, error: string) => {
      send({ type: 'SET_FIELD_ERROR', field, error })
    },
    [send]
  )

  // Handle form submission
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault()
      }

      send({ type: 'SUBMIT' })

      // Wait for validation to complete
      if (state.value === 'submitValid' && onSubmit) {
        try {
          await onSubmit(values)
          send({ type: 'SUBMIT_SUCCESS' })
        } catch (error) {
          console.error('Form submission error:', error)
          send({ type: 'SUBMIT_FAILURE', error: error as Error })
        }
      }
    },
    [send, state.value, values, onSubmit]
  )

  // Reset form
  const reset = useCallback(() => {
    send({ type: 'RESET' })
  }, [send])

  // Reset single field
  const resetField = useCallback(
    <K extends keyof T>(field: K) => {
      send({ type: 'RESET_FIELD', field })
    },
    [send]
  )

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    setFieldValue,
    setFieldError,
    setErrors: (errors: FormErrors<T>) => send({ type: 'SET_ERRORS', errors }),
    validateForm,
    validateField,
    handleSubmit,
    reset,
    resetField,
  }
}

/**
 * Create field-level validation helpers
 */
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
      const cleaned = cleanDigits(value)
      return cleaned.length !== 11 ? message : undefined
    },

  phone:
    (message = 'Telefone inválido') =>
    (value: string): string | undefined => {
      const cleaned = cleanDigits(value)
      return cleaned.length < 10 || cleaned.length > 11 ? message : undefined
    },
}
