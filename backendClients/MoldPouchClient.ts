import PouchDB from 'pouchdb';

import {BackendClient} from '../interfaces/BackendClient';
import {MoldResponse} from '../interfaces/MoldResponse';
import Mold from '../frontend/Mold';
import {MoldRequest} from '../interfaces/MoldRequest';
import {SetsDefinition} from '../transform/interfaces/MoldHook';
import MoldRequestTransform from '../transform/MoldRequestTransform';
import PouchDbAdapter from '../dbAdapters/pouchDb/PouchDbAdapter';
import {callAdapterRequestAction} from '../helpers/backendHelpers';
import {DB_ADAPTER_EVENT_TYPES} from '../interfaces/DbAdapter';


interface MoldPouchClientProps {
  pouchDb: PouchDB;
  sets: SetsDefinition;
  //schemas?: MoldSchema[];
}


/**
 * Adapter for Mold Backend which is used locally on a client(browser) side.
 * It works only with specified db.
 */
export default class MoldPouchClient implements BackendClient {
  readonly props: MoldPouchClientProps;
  readonly adapter: PouchDbAdapter;

  private mold!: Mold;
  private backendName!: string;
  private readonly transform: MoldRequestTransform;


  constructor(props: MoldPouchClientProps) {
    this.props = props;
    // TODO: передать юзера
    this.transform = new MoldRequestTransform(props.sets, this.doAdapterRequest);
    this.adapter = new PouchDbAdapter(props.pouchDb);

    this.adapter.onRecordChange(this.handleRecordChange);
    this.adapter.onError(this.mold.log.error);

    // TODO: use schema
    // TODO: validate props

  }

  async $init(mold: Mold, backendName: string) {
    this.mold = mold;
    this.backendName = backendName;

    await this.adapter.init();
  }

  async destroy() {
    this.transform.destroy();
    // TODO: destroy adapter
  }


  /**
   * Request from Mold
   */
  async request(request: MoldRequest): Promise<MoldResponse> {
    return this.transform.request(request);
  }

  /**
   * Request to adapter after "before" hooks.
   * It is useful for debug.
   */
  doAdapterRequest = (request: MoldRequest): Promise<MoldResponse> => {
    // TODO: может сюда перенести ???
    return callAdapterRequestAction(this.adapter, request);
  }


  private handleRecordChange = (set: string, id: string, type: DB_ADAPTER_EVENT_TYPES) => {
    this.mold.incomePush(this.backendName, [set, id, type]);
  }

}
