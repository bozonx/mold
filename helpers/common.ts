import {RequestBase} from '../frontend/interfaces/MethodsProps';
import {LOG_LEVELS, LogLevel} from '../frontend/interfaces/Logger';
import {RequestKey} from '../frontend/interfaces/RequestKey';


export function makeRequestId(props: RequestBase): RequestKey {
  // TODO: use все виды props
  // TODO: из параметров сделать уникальный id
  // TODO: поля должны быть отсортированны
}

/**
 * Makes ['info', 'warn', 'error'] if log level is 'info'
 */
export function calcAllowedLogLevels(logLevel: LogLevel): LogLevel[] {
  const currentLevelIndex: number = LOG_LEVELS.indexOf(logLevel);

  return LOG_LEVELS.slice(currentLevelIndex) as LogLevel[];
}
