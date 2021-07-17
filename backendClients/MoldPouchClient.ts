import PouchDB from 'pouchdb'

import {BackendClient} from '../interfaces/BackendClient'
import {MoldResponse} from '../interfaces/MoldResponse'
import Mold from '../frontend/Mold'
import {MoldRequest} from '../interfaces/MoldRequest'
import {SetsDefinition} from '../transform/interfaces/MoldHook'
import MoldRequestTransform from '../transform/MoldRequestTransform'
import PouchDbAdapter from '../dbAdapters/pouchDb/PouchDbAdapter'
import {callDbAdapterAction} from '../helpers/callDbAdapterAction'
import {DB_ADAPTER_EVENT_TYPES} from '../interfaces/DbAdapter'
import {MoldDocument} from '../interfaces/MoldDocument'


interface MoldPouchClientProps {
  pouchDb: PouchDB

  // TODO: может сразу передавать инстанс MoldRequestTransform
  transforms: SetsDefinition

  // TODO: а зачем???
  // set user if it is authorized, undefined if not.
  user?: MoldDocument
}


/**
 * Adapter for Mold Backend which is used locally on a client(browser) side.
 * It works only with specified db.
 */
export default class MoldPouchClient implements BackendClient {
  readonly props: MoldPouchClientProps
  readonly adapter: PouchDbAdapter

  private mold!: Mold
  private backendName!: string
  private readonly transform: MoldRequestTransform


  constructor(props: MoldPouchClientProps) {
    this.validateProps(props)

    this.props = props
    this.transform = new MoldRequestTransform(
      props.transforms,
      this.doAdapterRequest,
      this.props.user
    )
    this.adapter = new PouchDbAdapter(props.pouchDb)

    this.adapter.onChange(this.handleRecordChange)
    this.adapter.onError(this.mold.log.error)
  }

  async init(mold: Mold, backendName: string) {
    this.mold = mold
    this.backendName = backendName

    await this.adapter.init()
  }

  async destroy() {
    this.transform.destroy()
    await this.adapter.destroy()
  }


  /**
   * Request from Mold.
   * It throws an error only on fatal error
   */
  async request(request: MoldRequest): Promise<MoldResponse> {
    return this.transform.request(request)
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

  private validateProps(props: MoldPouchClientProps) {
    if (typeof props.pouchDb !== 'object') {
      throw new Error(`Incorrect "pouchDb" prop`)
    }
    else if (typeof props.transforms !== 'object') {
      throw new Error(`Incorrect "transforms" prop`)
    }
    else if (typeof props.user !== 'undefined' && typeof props.user !== 'object') {
      throw new Error(`Incorrect "user" prop`)
    }
  }

}
