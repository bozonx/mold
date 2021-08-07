import {MoldSeedContext} from '../interfaces/MoldSeedContext'
import {DbAdapter} from '../interfaces/DbAdapter'
import {stringifyMoldError} from '../helpers/helpers'
import {MoldSchema} from '../interfaces/MoldSchema'
import {normalizeSchema} from '../schema/normalizeSchema'


export class SeedContext implements MoldSeedContext {
  private readonly adapter: DbAdapter
  private readonly schema: MoldSchema | undefined
  private actions: (() => void)[] = []


  constructor(adapter: DbAdapter, rawSchema?: MoldSchema,) {
    this.adapter = adapter
    this.schema = rawSchema && normalizeSchema(rawSchema)
  }

  destroy() {
    this.actions = []
  }


  insert(set: string, docs: Record<string, any>[]) {
    this.actions.push(async () => {
      for (const doc of docs) {
        this.validateDoc(set, doc)
      }

      const result = await this.adapter.batchCreate(set, docs)

      if (result.success) return result

      // TODO: оно вообще так будет ???
      throw new Error(stringifyMoldError(result.errors))
    });
  }

  async startActions() {
    for (let cb of this.actions) {
      await cb()
    }
  }


  private validateDoc(set: string, doc: Record<string, any>) {
    // TODO: validate seed using schema
  }

}
