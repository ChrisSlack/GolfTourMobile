import { AuthApiError, PostgrestError } from '@supabase/supabase-js'

export interface Result<T> {
  data?: T
  error?: AuthApiError | PostgrestError | unknown
}

export function isAuthApiError(err: unknown): err is AuthApiError {
  return err instanceof AuthApiError
}

export function isPostgrestError(err: unknown): err is PostgrestError {
  return typeof err === 'object' && err !== null && 'code' in err && 'message' in err
}
