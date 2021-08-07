import {Logger, LogLevel} from 'squidlet-lib/src/interfaces/Logger'

import {MoldSeedContext} from '../interfaces/MoldSeedContext'
import {DbAdapter} from '../interfaces/DbAdapter'
import {SeedContext} from './SeedContext'
import {MoldSchema} from '../interfaces/MoldSchema'
import {resolveLogger} from '../helpers/common'


type SeedFunction = (context: MoldSeedContext) => void

export function moldDoSeed(
  adapter: DbAdapter,
  seed: (context: MoldSeedContext) => void,
  schema?: MoldSchema,
  log: Logger | LogLevel = 'debug',
) {
  const instance = new MoldSeed(adapter, seed, schema, log)

  instance.start()
}


export default class MoldSeed {
  private readonly adapter: DbAdapter
  private readonly seed: SeedFunction
  readonly log: Logger
  private readonly context: SeedContext


  constructor(
    adapter: DbAdapter,
    seed: SeedFunction,
    rawSchema?: MoldSchema,
    log?: Logger | LogLevel,
  ) {
    this.seed = seed
    this.adapter = adapter
    this.log = resolveLogger(log)
    this.context = new SeedContext(this.adapter, rawSchema)
  }

  destroy() {
    this.context.destroy()
  }


  start() {
    this.startAsync()
      .catch(this.log.error)
  }

  async startAsync() {
    try {
      this.seed(this.context)
    }
    catch (e) {
      this.context.destroy()

      throw e
    }

    await this.context.startActions()

    this.log.info('Done')

    this.context.destroy()
  }

}
