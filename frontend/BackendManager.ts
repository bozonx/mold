import Mold from './Mold'
import {BackendClient} from '../interfaces/BackendClient'
import {MoldRequest} from '../interfaces/MoldRequest'
import {MoldResponse} from '../interfaces/MoldResponse'
import {DEFAULT_BACKEND} from './constants'


/**
 * It makes a requests to the corresponding backend specified in Mold config.
 */
export default class BackendManager {
  private readonly mold: Mold

  private get backends(): Record<string, BackendClient> {
    return this.mold.props.backends || {}
  }


  constructor(mold: Mold) {
    this.mold = mold
  }

  /**
   * Run init functions of all the backends
   */
  async init() {
    await Promise.all(
      Object.keys(this.backends).map(async (backendName) => {
        const backend: BackendClient = this.backends[backendName]

        await backend.init?.(this.mold, backendName)
      })
    );
  }

  /**
   * Run destroy functions of all the backends
   */
  async destroy() {
    await Promise.all(
      Object.keys(this.backends).map(async (backendName) => {
        const backend: BackendClient = this.backends[backendName]

        await backend.destroy?.()
      })
    );
  }


  getBackend(backendName: string): BackendClient {
    if (!this.backends[backendName]) {
      throw new Error(`Can't find backend client "${backendName}"`)
    }

    return this.backends[backendName]
  }

  /**
   * It just makes the request to the specified backend client.
   * It doesn't care about are there any other similar requests.
   * It throws an error only on fatal error
   */
  request<T = any>(requestProps: MoldRequest, backendName: string = DEFAULT_BACKEND): Promise<MoldResponse> {
    const backendClient: BackendClient = this.getBackend(backendName)

    return backendClient.request(requestProps)
  }

}
