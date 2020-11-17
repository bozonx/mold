import BackendClient from '../interfaces/BackendClient';
import {MoldMiddleware} from '../interfaces/MoldMiddleware';
import BackendRequest from '../interfaces/BackendRequest';
import BackendResponse from '../interfaces/BackendResponse';


interface MoldPouchClientProps {
  middlewares: MoldMiddleware[];

  // TODO: add
}


/**
 * Adapter for Mold Backend which is used locally on a client(browser) side.
 */
export default class MoldPouchClient implements BackendClient {
  private readonly props: MoldPouchClientProps;


  constructor(props: MoldPouchClientProps) {
    this.props = props;
  }


  async request(request: BackendRequest): Promise<BackendResponse> {
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
