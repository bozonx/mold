import PouchDB from 'pouchdb'

import {BackendClient} from '../interfaces/BackendClient'
import {MoldResponse} from '../interfaces/MoldResponse'
import Mold from '../frontend/Mold'
import {MoldRequest} from '../interfaces/MoldRequest'
import PouchDbAdapter from '../dbAdapters/pouchDb/PouchDbAdapter'
import {callDbAdapterAction} from '../helpers/callDbAdapterAction'
import {DB_ADAPTER_EVENT_TYPES} from '../interfaces/DbAdapter'
import {MoldDocument} from '../interfaces/MoldDocument'
import {MoldMiddleware} from '../interfaces/MoldMiddleware'
import {MiddlewareRunner} from '../helpers/MiddlewareRunner'


/**
 * Adapter for Mold Backend which is used locally on a client(browser) side.
 * It works only with specified db.
 */
export default class MoldPouchClient implements BackendClient {
  readonly adapter: PouchDbAdapter

  private readonly middlewareRunner: MiddlewareRunner
  private mold!: Mold
  private backendName!: string


  constructor(
    pouchDb: PouchDB,
    // authorized user or undefined
    user?: MoldDocument,
    // middlewares to handle requests
    middlewares?: MoldMiddleware[] | MoldMiddleware
  ) {
    this.middlewareRunner = new MiddlewareRunner(
      this.doAdapterRequest,
      user,
      middlewares
    )
    this.adapter = new PouchDbAdapter(pouchDb)

    this.adapter.onChange(this.handleRecordChange)
    this.adapter.onError(this.mold.log.error)
  }

  async init(mold: Mold, backendName: string) {
    this.mold = mold
    this.backendName = backendName

    await this.adapter.init()
  }

  async destroy() {
    this.middlewareRunner.destroy()
    await this.adapter.destroy()
  }


  /**
   * Request from Mold.
   * It throws an error only on fatal error
   */
  async request(request: MoldRequest): Promise<MoldResponse> {
    return this.middlewareRunner.run(request)
  }

  /**
   * Request to adapter after "before" hooks.
   * It is useful for debug.
   */
  doAdapterRequest = async (request: MoldRequest): Promise<MoldResponse> => {
    return callDbAdapterAction(this.adapter, request)
  }


  private handleRecordChange = (set: string, id: string, type: DB_ADAPTER_EVENT_TYPES) => {

    console.log('change', [set, id, type])
    //this.mold.incomePush(this.backendName, [set, id, type])
  }

}
