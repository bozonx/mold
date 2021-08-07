import {Logger, LogLevel} from 'squidlet-lib/src/interfaces/Logger'
import ConsoleLogger from 'squidlet-lib/src/ConsoleLogger'


export function convertPageToOffset(
  page?: number,
  pageSize?: number
): { limit: number, skip: number } | undefined {
  if (!page || page < 0 || !pageSize || pageSize < 0) return

  return {
    limit: pageSize,
    skip: (page - 1) * pageSize,
  }
}


export function resolveLogger(rawLogger?: Logger | LogLevel): Logger {
  if (!rawLogger) return new ConsoleLogger()

  if (typeof rawLogger === 'string') return new ConsoleLogger(rawLogger)

  return rawLogger
}
