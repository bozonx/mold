import Mold from './Mold';
import {BackendClient} from '../interfaces/BackendClient';
import {MoldRequest} from '../interfaces/MoldRequest';
import {MoldResponse} from '../interfaces/MoldResponse';


/**
 * It makes a requests to the corresponding backend specified in Mold config.
 */
export default class BackendManager {
  private readonly mold: Mold;


  constructor(mold: Mold) {
    this.mold = mold;
  }

  async init() {
    await Promise.all(
      Object.keys(this.mold.props.backends!).map(async (backendName) => {
        const backend: BackendClient | undefined = this.mold.props.backends![backendName];

        if (backend?.$init) {
          await backend.$init(this.mold, backendName);
        }
      })
    );
  }

  destroy() {
  }


  getBackend(backendName: string): BackendClient {
    if (!this.mold.props.backends?.[backendName]) {
      throw new Error(`Can't find backend client "${backendName}"`);
    }

    return this.mold.props.backends[backendName]!;
  }

  /**
   * It just makes the request to the specified backend client.
   * It doesn't care about are there any other similar requests.
   */
  request<T = any>(backendName: string, requestProps: MoldRequest): Promise<MoldResponse> {
    const backendClient: BackendClient = this.getBackend(backendName);

    return backendClient.request(requestProps);
  }

}
