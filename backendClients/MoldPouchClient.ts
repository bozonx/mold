import BackendClient from '../interfaces/BackendClient';
import {MoldResponse} from '../interfaces/MoldResponse';
import Mold from '../frontend/Mold';
import MoldRequest from '../interfaces/MoldRequest';
import {SetsDefinition} from '../hooksMidleware/interfaces/MoldHook';
import MoldHooks from '../hooksMidleware/MoldHooks';


interface MoldPouchClientProps {
  sets: SetsDefinition;
}


/**
 * Adapter for Mold Backend which is used locally on a client(browser) side.
 */
export default class MoldPouchClient implements BackendClient {
  private readonly props: MoldPouchClientProps;
  private mold!: Mold;
  private hooks: MoldHooks;


  constructor(props: MoldPouchClientProps) {
    this.props = props;
    this.hooks = new MoldHooks(props.sets, this.hooksRequestFunc);
    // TODO: слушать события pouch и выполнять mold.incomePush
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
}
