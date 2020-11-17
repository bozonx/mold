import BackendClient from '../interfaces/BackendClient';
import {MoldMiddleware} from '../interfaces/MoldMiddleware';
import BackendResponse from '../interfaces/BackendResponse';
import Mold from '../frontend/Mold';
import MoldRequest from '../interfaces/MoldRequest';


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


  async request(set: string, request: MoldRequest): Promise<BackendResponse> {
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
