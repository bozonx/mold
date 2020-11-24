import {MoldSeedContext} from './interfaces/MoldSeedContext';
import {Logger, LogLevel} from '../frontend/interfaces/Logger';
import {DbAdapter} from '../interfaces/DbAdapter';
import ConsoleLogger from '../helpers/ConsoleLogger';


// TODO: validate seeds

interface MoldSeedProps {
  seed: (context: MoldSeedContext) => void;
  adapter: DbAdapter;
  log?: Logger;
}


export default class MoldSeed {
  private readonly props: MoldSeedProps;

  get log(): Logger {
    return this.props.log as any;
  }


  constructor(props: MoldSeedProps) {
    this.props = this.prepareProps(props);
  }


  start() {

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
