import {MoldSeedContext} from './interfaces/MoldSeedContext';
import {Logger, LogLevel} from '../frontend/interfaces/Logger';
import {DbAdapter} from '../interfaces/DbAdapter';
import ConsoleLogger from '../helpers/ConsoleLogger';
import {SeedContext} from './SeedContext';


interface MoldSeedProps {
  seed: (context: MoldSeedContext) => void;
  adapter: DbAdapter;
  log?: Logger | LogLevel;
}


export default class MoldSeed {
  private readonly props: MoldSeedProps;
  private readonly context: SeedContext;

  get log(): Logger {
    return this.props.log as any;
  }


  constructor(props: MoldSeedProps) {
    this.props = this.prepareProps(props);
    this.context = new SeedContext(this.props.adapter);
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
      this.props.seed(this.context);
    }
    catch (e) {
      this.context.destroy();

      throw e;
    }

    await this.context.startActions();

    this.log.info('Done');

    this.context.destroy();
  }

  private prepareProps(props: Partial<MoldSeedProps>): MoldSeedProps {
    if (!props.seed) throw new Error(`Please specify the seed`);
    else if (!props.adapter) throw new Error(`Please specify the adapter`);

    return {
      seed: props.seed,
      adapter: props.adapter,
      log: this.resolveLogger(props.log),
    }
  }

  private resolveLogger(rawLogger?: Logger | LogLevel): Logger {
    if (!rawLogger) return new ConsoleLogger();

    if (typeof rawLogger === 'string') return new ConsoleLogger(rawLogger);

    return rawLogger;
  }

}
