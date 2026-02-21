/**
 * Form State Machine
 *
 * XState machine for form state management
 */

import { assign, fromPromise, setup } from 'xstate'

type FormErrors<T> = Partial<Record<keyof T, string>>
type TouchedFields<T> = Partial<Record<keyof T, boolean>>
type FormValidator<T> = (values: T) => FormErrors<T> | Promise<FormErrors<T>>

interface FormContext<T> {
  values: T
  errors: FormErrors<T>
  touched: TouchedFields<T>
  isSubmitting: boolean
  initialValues: T
  validateOnChange: boolean
  validateOnBlur: boolean
}

type FormEvent<T> =
  | { type: 'CHANGE_FIELD'; field: keyof T; value: T[keyof T] }
  | { type: 'BLUR_FIELD'; field: keyof T }
  | { type: 'SET_FIELD_VALUE'; field: keyof T; value: T[keyof T] }
  | { type: 'SET_FIELD_ERROR'; field: keyof T; error: string }
  | { type: 'SET_ERRORS'; errors: FormErrors<T> }
  | { type: 'SUBMIT' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_FAILURE'; error: Error }
  | { type: 'RESET' }
  | { type: 'RESET_FIELD'; field: keyof T }
  | { type: 'VALIDATE_FORM' }
  | { type: 'VALIDATE_FIELD'; field: keyof T }
  | { type: 'VALIDATION_SUCCESS'; errors: FormErrors<T> }
  | { type: 'FIELD_VALIDATION_SUCCESS'; field: keyof T; error?: string }

// Type helper for the machine return type (for isolated declarations)
type FormMachineType<T> = ReturnType<
  typeof setup<{
    context: FormContext<T>
    events: FormEvent<T>
  }>['createMachine']
>

export function createFormMachine<T extends Record<string, unknown>>(
  initialValues: T,
  validate?: FormValidator<T>,
  validateOnChange = true,
  validateOnBlur = true
): FormMachineType<T> {
  return setup({
    types: {
      context: {} as FormContext<T>,
      events: {} as FormEvent<T>,
    },
    actors: {
      validateForm: fromPromise(async ({ input }: { input: { values: T } }) => {
        if (!validate) {
          return {}
        }
        const errors = await validate(input.values)
        return errors
      }),
      validateField: fromPromise(async ({ input }: { input: { values: T; field: keyof T } }) => {
        if (!validate) {
          return undefined
        }
        const errors = await validate(input.values)
        return errors[input.field]
      }),
    },
    actions: {
      updateFieldValue: assign(({ context, event }) => {
        if (event.type === 'CHANGE_FIELD' || event.type === 'SET_FIELD_VALUE') {
          return {
            values: {
              ...context.values,
              [event.field]: event.value,
            },
          }
        }
        return {}
      }),
      markFieldTouched: assign(({ context, event }) => {
        if (event.type === 'CHANGE_FIELD' || event.type === 'BLUR_FIELD') {
          return {
            touched: {
              ...context.touched,
              [event.field]: true,
            },
          }
        }
        return {}
      }),
      markAllFieldsTouched: assign(({ context }) => ({
        touched: Object.keys(context.values).reduce(
          (acc, key) => {
            acc[key as keyof T] = true
            return acc
          },
          {} as TouchedFields<T>
        ),
      })),
      setFieldError: assign(({ context, event }) => {
        if (event.type === 'SET_FIELD_ERROR') {
          return {
            errors: {
              ...context.errors,
              [event.field]: event.error,
            },
          }
        }
        return {}
      }),
      setErrors: assign(({ event }) => {
        if (event.type === 'SET_ERRORS') {
          return { errors: event.errors }
        } else if ('output' in event && event.output) {
          return { errors: event.output as FormErrors<T> }
        }
        return { errors: {} }
      }),
      setFieldValidationResult: assign(({ context, event }) => {
        if (
          'output' in event &&
          'input' in event &&
          typeof event.input === 'object' &&
          event.input &&
          'field' in event.input
        ) {
          const input = event.input as { values: T; field: keyof T }
          const field = input.field
          const error = event.output as string | undefined
          if (error) {
            return {
              errors: {
                ...context.errors,
                [field]: error,
              },
            }
          }
          const { [field]: _, ...rest } = context.errors
          return { errors: rest as FormErrors<T> }
        }
        return {}
      }),
      setSubmitting: assign(() => ({
        isSubmitting: true,
      })),
      clearSubmitting: assign(() => ({
        isSubmitting: false,
      })),
      resetForm: assign(({ context }) => ({
        values: context.initialValues,
        errors: {},
        touched: {},
        isSubmitting: false,
      })),
      resetField: assign(({ context, event }) => {
        if (event.type === 'RESET_FIELD') {
          const { [event.field]: _errorToRemove, ...restErrors } = context.errors
          const { [event.field]: _touchedToRemove, ...restTouched } = context.touched
          return {
            values: {
              ...context.values,
              [event.field]: context.initialValues[event.field],
            },
            errors: restErrors as FormErrors<T>,
            touched: restTouched as TouchedFields<T>,
          }
        }
        return {}
      }),
    },
  }).createMachine({
    id: 'form',
    initial: 'idle',
    context: {
      values: initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
      initialValues,
      validateOnChange,
      validateOnBlur,
    },
    states: {
      idle: {
        on: {
          CHANGE_FIELD: {
            actions: ['updateFieldValue', 'markFieldTouched'],
            target: 'validatingField',
            guard: ({ context, event }) =>
              context.validateOnChange && !!context.touched[event.field],
          },
          BLUR_FIELD: {
            actions: 'markFieldTouched',
            target: 'validatingField',
            guard: ({ context }) => context.validateOnBlur,
          },
          SET_FIELD_VALUE: {
            actions: 'updateFieldValue',
          },
          SET_FIELD_ERROR: {
            actions: 'setFieldError',
          },
          SET_ERRORS: {
            actions: 'setErrors',
          },
          SUBMIT: {
            target: 'submitting',
          },
          RESET: {
            actions: 'resetForm',
          },
          RESET_FIELD: {
            actions: 'resetField',
          },
          VALIDATE_FORM: {
            target: 'validatingForm',
          },
          VALIDATE_FIELD: {
            target: 'validatingField',
          },
        },
      },
      validatingForm: {
        invoke: {
          src: 'validateForm',
          input: ({ context }) => ({ values: context.values }),
          onDone: {
            target: 'idle',
            actions: 'setErrors',
          },
          onError: {
            target: 'idle',
          },
        },
      },
      validatingField: {
        invoke: {
          src: 'validateField',
          input: ({ context, event }) => {
            if ('field' in event && event.field) {
              return {
                values: context.values,
                field: event.field,
              }
            }
            // Default field for cases where field is not available
            const firstKey = Object.keys(context.values)[0] as keyof T
            return {
              values: context.values,
              field: firstKey,
            }
          },
          onDone: {
            target: 'idle',
            actions: 'setFieldValidationResult',
          },
          onError: {
            target: 'idle',
          },
        },
      },
      submitting: {
        entry: ['markAllFieldsTouched', 'setSubmitting'],
        invoke: {
          src: 'validateForm',
          input: ({ context }) => ({ values: context.values }),
          onDone: [
            {
              target: 'submitValid',
              guard: ({ event }) => Object.keys(event.output).length === 0,
              actions: 'setErrors',
            },
            {
              target: 'idle',
              actions: ['setErrors', 'clearSubmitting'],
            },
          ],
          onError: {
            target: 'idle',
            actions: 'clearSubmitting',
          },
        },
      },
      submitValid: {
        on: {
          SUBMIT_SUCCESS: {
            target: 'idle',
            actions: 'clearSubmitting',
          },
          SUBMIT_FAILURE: {
            target: 'idle',
            actions: 'clearSubmitting',
          },
        },
      },
    },
  })
}

// Selectors
export const getFormValues = <T>(state: { context: FormContext<T> }): T => state.context.values
export const getFormErrors = <T>(state: { context: FormContext<T> }): FormErrors<T> => state.context.errors
export const getFieldError = <T, K extends keyof T>(state: { context: FormContext<T> }, field: K): string | undefined =>
  state.context.errors[field]
export const isFieldTouched = <T, K extends keyof T>(
  state: { context: FormContext<T> },
  field: K
): boolean => state.context.touched[field] || false
export const isFormSubmitting = <T>(state: { context: FormContext<T> }): boolean =>
  state.context.isSubmitting
export const isFormValid = <T>(state: { context: FormContext<T> }): boolean =>
  Object.keys(state.context.errors).length === 0
export const isFormDirty = <T>(state: { context: FormContext<T> }): boolean =>
  JSON.stringify(state.context.values) !== JSON.stringify(state.context.initialValues)
