import PouchDB from 'pouchdb';

import BackendClient from '../interfaces/BackendClient';
import {MoldResponse} from '../interfaces/MoldResponse';
import Mold from '../frontend/Mold';
import MoldRequest from '../interfaces/MoldRequest';
import {SetsDefinition} from '../hooksMidleware/interfaces/MoldHook';
import MoldHooks from '../hooksMidleware/MoldHooks';
import PouchDbAdapter from '../dbAdapters/PouchDb/PouchDbAdapter';


interface MoldPouchClientProps {
  pouch: PouchDB;
  db: string;
  sets: SetsDefinition;
}


/**
 * Adapter for Mold Backend which is used locally on a client(browser) side.
 * It works only with specified db.
 */
export default class MoldPouchClient implements BackendClient {
  private readonly props: MoldPouchClientProps;
  private mold!: Mold;
  private readonly hooks: MoldHooks;
  private readonly pouchAdapter: PouchDbAdapter;


  constructor(props: MoldPouchClientProps) {
    this.props = props;
    this.hooks = new MoldHooks(props.sets, this.hooksRequestFunc);
    this.pouchAdapter = new PouchDbAdapter(props.pouch);

    //this.pouchAdapter.onRecordChange(this.handleRecordChange);
  }

  $init(mold: Mold) {
    this.mold = mold;
  }

  destroy() {
    this.hooks.destroy();
  }


  async request(request: MoldRequest): Promise<MoldResponse> {
    return this.hooks.request(request);
  }


  private hooksRequestFunc = (request: MoldRequest): Promise<MoldResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 200,
          errors: null,
          success: true,
          result: {
            data: [
              { name: 'fff' }
            ]
          } as any,
        })
      }, 2000)
    });
  }

  private handleRecordChange = () => {
    // TODO: слушать события pouch и выполнять mold.incomePush

  }
}
