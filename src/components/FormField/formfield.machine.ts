/**
 * FormField State Machine (XState v5)
 *
 * Manages form field states including validation and error display
 */

import { type ActorRefFrom, assign, type StateFrom, setup } from 'xstate'
import type { FieldError } from '@pleme/types'

export interface FormFieldContext {
  value: string
  error?: FieldError
  touched: boolean
  dirty: boolean
  validating: boolean
  focused: boolean
}

export type FormFieldEvent =
  | { type: 'FOCUS' }
  | { type: 'BLUR' }
  | { type: 'CHANGE'; value: string }
  | { type: 'VALIDATE' }
  | { type: 'SET_ERROR'; error: FieldError }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET' }
  | { type: 'SUBMIT_ATTEMPT' }

// Type helper for the machine (for isolated declarations)
type FormFieldMachineType = ReturnType<
  typeof setup<{
    context: FormFieldContext
    events: FormFieldEvent
  }>['createMachine']
>

export const formFieldMachine: FormFieldMachineType = setup({
  types: {
    context: {} as FormFieldContext,
    events: {} as FormFieldEvent,
  },

  actions: {
    setFocused: assign({ focused: true }),
    setBlurred: assign({ focused: false, touched: true }),
    setTouched: assign({ touched: true }),

    setValue: assign(({ context, event }) => {
      if (event.type !== 'CHANGE') {
        return context
      }
      return {
        ...context,
        value: event.value,
        dirty: true,
        error: undefined, // Clear error on change
      }
    }),

    setError: assign(({ context, event }) => {
      if (event.type !== 'SET_ERROR') {
        return context
      }
      return {
        ...context,
        error: event.error,
        validating: false,
      }
    }),

    clearError: assign({
      error: undefined,
      validating: false,
    }),

    setValidating: assign({ validating: true }),

    reset: assign({
      value: '',
      error: undefined,
      touched: false,
      dirty: false,
      validating: false,
      focused: false,
    }),
  },
}).createMachine({
  id: 'formField',
  initial: 'pristine',
  context: {
    value: '',
    error: undefined,
    touched: false,
    dirty: false,
    validating: false,
    focused: false,
  },
  states: {
    pristine: {
      on: {
        FOCUS: {
          target: 'focused',
          actions: 'setFocused',
        },
        SUBMIT_ATTEMPT: {
          target: 'blurred',
          actions: 'setTouched',
        },
      },
    },
    focused: {
      on: {
        BLUR: {
          target: 'blurred',
          actions: 'setBlurred',
        },
        CHANGE: {
          actions: 'setValue',
        },
      },
    },
    blurred: {
      on: {
        FOCUS: {
          target: 'focused',
          actions: 'setFocused',
        },
        VALIDATE: 'validating',
        SET_ERROR: {
          target: 'invalid',
          actions: 'setError',
        },
        CLEAR_ERROR: {
          target: 'valid',
          actions: 'clearError',
        },
      },
    },
    validating: {
      entry: 'setValidating',
      on: {
        SET_ERROR: {
          target: 'invalid',
          actions: 'setError',
        },
        CLEAR_ERROR: {
          target: 'valid',
          actions: 'clearError',
        },
      },
    },
    invalid: {
      on: {
        FOCUS: {
          target: 'focused',
          actions: 'setFocused',
        },
        CHANGE: {
          target: 'focused',
          actions: ['setValue', 'setFocused'],
        },
      },
    },
    valid: {
      on: {
        FOCUS: {
          target: 'focused',
          actions: 'setFocused',
        },
        SET_ERROR: {
          target: 'invalid',
          actions: 'setError',
        },
      },
    },
  },
  on: {
    RESET: {
      target: '.pristine',
      actions: 'reset',
    },
  },
})

// Type helpers for components
export type FormFieldMachineSnapshot = StateFrom<typeof formFieldMachine>
export type FormFieldMachineActor = ActorRefFrom<typeof formFieldMachine>

// Type-safe state value helpers
export const isPristine = (snapshot: FormFieldMachineSnapshot): boolean => snapshot.matches('pristine')
export const isFocused = (snapshot: FormFieldMachineSnapshot): boolean => snapshot.matches('focused')
export const isBlurred = (snapshot: FormFieldMachineSnapshot): boolean => snapshot.matches('blurred')
export const isValidating = (snapshot: FormFieldMachineSnapshot): boolean => snapshot.matches('validating')
export const isInvalid = (snapshot: FormFieldMachineSnapshot): boolean => snapshot.matches('invalid')
export const isValid = (snapshot: FormFieldMachineSnapshot): boolean => snapshot.matches('valid')
