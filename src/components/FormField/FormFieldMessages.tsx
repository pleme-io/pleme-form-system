/**
 * FormField Message Components
 *
 * Level 2 Molecule - Error, success, and helper messages
 */

import { CheckCircle, Error as ErrorIcon } from '@mui/icons-material'
import { Box, Typography } from '@mui/material'
import type React from 'react'

export interface FieldMessagesProps {
  fieldId: string
  error?: string
  success?: string
  helperText?: string
  showError?: boolean
  showSuccess?: boolean
}

export const FieldMessages: React.FC<FieldMessagesProps> = ({
  fieldId,
  error,
  success,
  helperText,
  showError,
  showSuccess,
}) => {
  return (
    <Box sx={{ mt: 0.5 }}>
      {showError && error && (
        <Box
          id={`${fieldId}-error`}
          role="alert"
          aria-live="assertive"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: 'error.main',
          }}
        >
          <ErrorIcon fontSize="small" />
          <Typography variant="caption" color="error.main">
            {error}
          </Typography>
        </Box>
      )}

      {showSuccess && success && (
        <Box
          id={`${fieldId}-success`}
          role="status"
          aria-live="polite"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: 'success.main',
          }}
        >
          <CheckCircle fontSize="small" />
          <Typography variant="caption" color="success.main">
            {success}
          </Typography>
        </Box>
      )}

      {!showError && !showSuccess && helperText && (
        <Typography id={`${fieldId}-helper`} variant="caption" color="text.secondary">
          {helperText}
        </Typography>
      )}
    </Box>
  )
}
