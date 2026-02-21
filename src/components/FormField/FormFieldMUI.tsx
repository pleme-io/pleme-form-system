/**
 * FormFieldMUI Component
 *
 * Level 2 Molecule - Form field with label and error using MUI
 */

import { Info as InfoIcon } from '@mui/icons-material'
import {
  Box,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  TextField,
  type TextFieldProps,
  Tooltip,
} from '@mui/material'
import type React from 'react'

export interface FormFieldMUIProps extends Omit<TextFieldProps, 'error'> {
  /**
   * Field label
   */
  label?: string

  /**
   * Helper text below the field
   */
  helperText?: string

  /**
   * Error message
   */
  error?: string

  /**
   * Whether the field is required
   */
  required?: boolean

  /**
   * Whether to show required indicator
   */
  showRequired?: boolean

  /**
   * Whether to show optional indicator
   */
  showOptional?: boolean

  /**
   * Info tooltip content
   */
  tooltip?: string
}

export const FormFieldMUI: React.FC<FormFieldMUIProps> = ({
  label,
  helperText,
  error,
  required,
  showRequired = true,
  showOptional = false,
  tooltip,
  ...textFieldProps
}) => {
  const showRequiredIndicator = required && showRequired
  const showOptionalIndicator = !required && showOptional

  // If using TextField with built-in label
  if (!label || textFieldProps.variant === 'outlined' || textFieldProps.variant === 'filled') {
    return (
      <TextField
        {...textFieldProps}
        label={label}
        error={!!error}
        helperText={error || helperText}
        required={showRequiredIndicator}
        InputLabelProps={{
          ...textFieldProps.InputLabelProps,
          required: showRequiredIndicator,
        }}
      />
    )
  }

  // For more complex layouts with separate label
  return (
    <FormControl
      fullWidth={textFieldProps.fullWidth}
      error={!!error}
      disabled={textFieldProps.disabled}
    >
      {label && (
        <FormLabel
          required={showRequiredIndicator}
          sx={{
            mb: 0.5,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          {label}
          {showOptionalIndicator && (
            <Box component="span" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
              (opcional)
            </Box>
          )}
          {tooltip && (
            <Tooltip title={tooltip} placement="top">
              <IconButton size="small" sx={{ p: 0.25 }}>
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </FormLabel>
      )}
      <TextField {...textFieldProps} error={!!error} variant="outlined" />
      {(error || helperText) && <FormHelperText>{error || helperText}</FormHelperText>}
    </FormControl>
  )
}
