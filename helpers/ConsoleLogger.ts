import {Logger, LogLevel} from '../shared/intefaces/Logger';
import {calcAllowedLogLevels} from './common';


export default class ConsoleLogger implements Logger {
  private readonly allowDebug: boolean;
  private readonly allowInfo: boolean;
  private readonly allowWarn: boolean;


  constructor(level: LogLevel = 'info') {
    const allowedLogLevels: LogLevel[] = calcAllowedLogLevels(level);

    this.allowDebug = allowedLogLevels.includes('debug');
    this.allowInfo = allowedLogLevels.includes('info');
    this.allowWarn = allowedLogLevels.includes('warn');
  }


  debug = (message: string) => {
    if (!this.allowDebug) return;

    console.info(`DEBUG mold: ${message}`);
  }

  info = (message: string) => {
    if (!this.allowInfo) return;

    console.info(`INFO mold: ${message}`);
  }

  warn = (message: string) => {
    if (!this.allowWarn) return;

    console.warn(`WARNING mold: ${message}`);
  }

  error = (message: string | Error) => {
    console.error(`ERROR mold: ${message}`);
  }

}
