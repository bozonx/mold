import {MoldSeedContext} from '../interfaces/MoldSeedContext';
import {Logger, LogLevel} from '../interfaces/Logger';
import {DbAdapter} from '../interfaces/DbAdapter';
import ConsoleLogger from '../helpers/ConsoleLogger';
import {SeedContext} from './SeedContext';
import {extractSeedFromSchema} from '../__old/extractSeedFromSchema';
import {MoldSchema} from '../interfaces/MoldSchema';
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

    const schema: MoldSchema = normalizeSchema(rawSchema);

    // TODO: validate seed using schema

    // TODO: remove
    this.seed = (props.seed) ? props.seed : extractSeedFromSchema(props.schemas!);
    this.adapter = props.adapter;
    this.log = this.resolveLogger(props.log);
    this.context = new SeedContext(this.adapter);

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

      throw e;
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
