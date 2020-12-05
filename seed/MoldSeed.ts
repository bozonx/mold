import {MoldSeedContext} from '../interfaces/MoldSeedContext';
import {Logger, LogLevel} from '../interfaces/Logger';
import {DbAdapter} from '../interfaces/DbAdapter';
import ConsoleLogger from '../helpers/ConsoleLogger';
import {SeedContext} from './SeedContext';
import {MoldSchema} from '../interfaces/MoldSchema';
import {extractSeedFromSchema} from '../__old/extractSeedFromSchema';


interface MoldSeedProps {
  adapter: DbAdapter;
  schemas?: MoldSchema[];
  seed?: (context: MoldSeedContext) => void;
  log?: Logger | LogLevel;
}


export default class MoldSeed {
  private readonly adapter: DbAdapter;
  private readonly seed: (context: MoldSeedContext) => void;
  private readonly log: Logger;
  private readonly context: SeedContext;


  constructor(props: MoldSeedProps) {
    if (!props.seed && !props.schemas) {
      throw new Error(`Please specify almost seed or schema`);
    }
    else if (!props.adapter) {
      throw new Error(`Please specify the adapter`);
    }

    // TODO: remove
    this.seed = (props.seed) ? props.seed : extractSeedFromSchema(props.schemas!);
    this.adapter = props.adapter;
    this.log = this.resolveLogger(props.log);
    this.context = new SeedContext(this.adapter);
  }

  destroy() {
    this.context.destroy();
  }


  start() {
    this.doStart()
      .catch(this.log.error);
  }


  private async doStart() {
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
