export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export const LOG_LEVELS = ['debug', 'info', 'warn', 'error']

export interface Logger {
  debug: (msg: string) => void
  info: (msg: string) => void
  warn: (msg: string) => void
  error: (msg: string) => void
}
