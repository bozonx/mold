import PouchDB from 'pouchdb';

import {BackendClient} from '../interfaces/BackendClient';
import {MoldResponse} from '../interfaces/MoldResponse';
import Mold from '../frontend/Mold';
import {MoldRequest} from '../interfaces/MoldRequest';
import {SetsDefinition} from '../hooksMidleware/interfaces/MoldHook';
import MoldHooks from '../hooksMidleware/MoldHooks';
import PouchDbAdapter from '../dbAdapters/PouchDbAdapter';
import {callAdapterRequestAction} from '../helpers/backendHelpers';


interface MoldPouchClientProps {
  db: PouchDB;
  sets: SetsDefinition;
}


/**
 * Adapter for Mold Backend which is used locally on a client(browser) side.
 * It works only with specified db.
 */
export default class MoldPouchClient implements BackendClient {
  readonly props: MoldPouchClientProps;
  readonly adapter: PouchDbAdapter;

  private mold!: Mold;
  private readonly hooks: MoldHooks;


  constructor(props: MoldPouchClientProps) {
    this.props = props;
    this.hooks = new MoldHooks(props.sets, this.doAdapterRequest);
    this.adapter = new PouchDbAdapter(props.db);

    this.adapter.onRecordChange(this.handleRecordChange);
  }

  $init(mold: Mold) {
    this.mold = mold;
  }

  destroy() {
    this.hooks.destroy();
  }


  /**
   * Request from Mold
   */
  async request(request: MoldRequest): Promise<MoldResponse> {
    return this.hooks.request(request);
  }

  /**
   * Request to adapter after "before" hooks.
   * It is useful for debug.
   */
  doAdapterRequest = (request: MoldRequest): Promise<MoldResponse> => {
    return callAdapterRequestAction(this.adapter, request);
  }


  private handleRecordChange = (set: string, action: string, response: MoldResponse) => {
    // TODO: выполнять mold.incomePush
    console.log(5555555555, set, action, response);
  }
}
