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
import {MoldDocument} from '../interfaces/MoldDocument';


interface MoldPouchClientProps {
  pouchDb: PouchDB;
  sets: SetsDefinition;
  // set user if it is authorized, undefined if not.
  user?: MoldDocument;
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
    this.validateProps(props);

    this.props = props;
    this.transform = new MoldRequestTransform(
      props.sets,
      this.doAdapterRequest,
      this.props.user
    );
    this.adapter = new PouchDbAdapter(props.pouchDb);

    this.adapter.onChange(this.handleRecordChange);
    this.adapter.onError(this.mold.log.error);
  }

  async $init(mold: Mold, backendName: string) {
    this.mold = mold;
    this.backendName = backendName;

    await this.adapter.init();
  }

  async destroy() {
    this.transform.destroy();
    await this.adapter.destroy();
  }


  /**
   * Request from Mold
   */
  async request(request: MoldRequest): Promise<MoldResponse> {
    // TODO: review
    return this.transform.request(request);
  }

  /**
   * Request to adapter after "before" hooks.
   * It is useful for debug.
   */
  doAdapterRequest = (request: MoldRequest): Promise<MoldResponse> => {
    // TODO: review
    // TODO: может сюда перенести ???
    return callAdapterRequestAction(this.adapter, request);
  }


  private handleRecordChange = (set: string, id: string, type: DB_ADAPTER_EVENT_TYPES) => {
    this.mold.incomePush(this.backendName, [set, id, type]);
  }

  private validateProps(props: MoldPouchClientProps) {
    // TODO: add

  }

}
