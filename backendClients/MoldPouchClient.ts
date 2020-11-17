import BackendClient from '../interfaces/BackendClient';
import {MoldMiddleware} from '../interfaces/MoldMiddleware';
import BackendResponse from '../interfaces/BackendResponse';
import Mold from '../frontend/Mold';
import {RequestBase} from '../interfaces/RequestBase';


interface MoldPouchClientProps {
  middlewares: MoldMiddleware[];

  // TODO: add
}


/**
 * Adapter for Mold Backend which is used locally on a client(browser) side.
 */
export default class MoldPouchClient implements BackendClient {
  private readonly props: MoldPouchClientProps;
  private mold!: Mold;


  constructor(props: MoldPouchClientProps) {
    this.props = props;

    // TODO: слушать события pouch и выполнять mold.incomePush
  }

  $init(mold: Mold) {
    this.mold = mold;
  }


  async request(set: string, request: RequestBase): Promise<BackendResponse> {
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
          },
        })
      }, 2000)
    });
  }
}
