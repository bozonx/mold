import ConsoleLogger from 'squidlet-lib/src/ConsoleLogger'
import {Logger, LogLevel} from 'squidlet-lib/src/interfaces/Logger'

import {MoldSeedContext} from '../interfaces/MoldSeedContext'
import {DbAdapter} from '../interfaces/DbAdapter'
import {SeedContext} from './SeedContext'
import {MoldSchema} from '../interfaces/MoldSchema'
//import {extractSeedFromSchema} from '../__old/extractSeedFromSchema';
import {normalizeSchema} from '../schema/normalizeSchema';


export default class MoldSeed {
  private readonly adapter: DbAdapter;
  private readonly seed: (context: MoldSeedContext) => void;
  readonly log: Logger;
  private readonly context: SeedContext;


  constructor(
    adapter: DbAdapter,
    seed: (context: MoldSeedContext) => void,
    rawSchema?: MoldSchema,
    log?: Logger | LogLevel,
  ) {

    //const schema: MoldSchema = normalizeSchema(rawSchema);

    // TODO: validate seed using schema

    // TODO: remove
    //this.seed = (seed) ? seed : extractSeedFromSchema(schemas!);
    this.seed = seed
    this.adapter = adapter
    this.log = this.resolveLogger(log)
    this.context = new SeedContext(this.adapter)

    // TODO: запустить сразу
  }

  destroy() {
    this.context.destroy();
  }


  start() {
    this.startAsync()
      .catch(this.log.error);
  }

  async startAsync() {
    try {
      this.seed(this.context);
    }
    catch (e) {
      this.context.destroy();

      throw e
    }

    await this.context.startActions();

    this.log.info('Done');

    this.context.destroy();
  }

  private resolveLogger(rawLogger?: Logger | LogLevel): Logger {
    if (!rawLogger) return new ConsoleLogger();

    if (typeof rawLogger === 'string') return new ConsoleLogger(rawLogger);

    return rawLogger;
  }

}

export function moldSeed(
  adapter: DbAdapter,
  seed: (context: MoldSeedContext) => void,
  schema?: MoldSchema,
  log: Logger | LogLevel = 'debug',
) {
  const instance = new MoldSeed(adapter, seed, schema, log);

  instance.start();
}
