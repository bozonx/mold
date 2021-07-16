import {ActionProps} from './interfaces/ActionProps'
import {REQUEST_KEY_SEPARATOR, RequestKey} from './interfaces/RequestKey'
import {requestKeyToString, splitInstanceId} from '../helpers/helpers'
import {isEmptyObject} from '../helpers/objects'


export class InstancesStore {
  // props of requests like { backend: { set: { action: { request: {...props} } } } }
  private requests: Record<string, Record<string, Record<string, Record<string, ActionProps>>>> = {}
  // object like: { "backend|set|action|request": ["0", "1", ...] }
  private instances: Record<string, string[]> = {}


  constructor() {
  }

  destroy() {
    this.instances = {}
    this.requests = {}
  }


  getProps(requestKey: RequestKey): ActionProps | undefined {
    const [backend, set, action, request] = requestKey

    return this.requests[backend]
      && this.requests[backend][set]
      && this.requests[backend][set][action]
      && this.requests[backend][set][action][request]
  }

  eachAction(
    backendName: string,
    set: string,
    cb: (actionName: string, actionRequests: {[index: string]: ActionProps}) => void
  ) {
    if (!this.requests[backendName]?.[set]) return

    for (let actionName of Object.keys(this.requests[backendName][set])) {
      cb(actionName, this.requests[backendName][set][actionName])
    }
  }

  doesInstanceNumExist(requestKey: RequestKey, instanceNum: string): boolean {
    const requestKeyStr: string = requestKeyToString(requestKey)
    const requestInstances: string[] | undefined = this.instances[requestKeyStr]

    if (!requestInstances) return false
    // TODO: test
    return requestInstances.indexOf(instanceNum) >= 0
  }

  addInstance(requestKey: RequestKey, props: ActionProps): string {
    const requestKeyStr: string = requestKeyToString(requestKey)
    const requestInstances: string[] | undefined = this.instances[requestKeyStr]
    let newInstanceNum = '0'
    // put or update request props into store
    this.storeProps(requestKey, props)

    if (requestInstances) {
      // TODO: test by hard
      const newInstanceNum: string = String(this.instances[requestKeyStr].length)

      this.instances[requestKeyStr].push(newInstanceNum)
    }
    else {
      this.instances[requestKeyStr] = [newInstanceNum]
    }

    return requestKeyStr + REQUEST_KEY_SEPARATOR + newInstanceNum
  }

  removeInstance(instanceId: string) {
    const {requestKey, instanceNum} = splitInstanceId(instanceId)
    const requestKeyStr: string = requestKeyToString(requestKey)
    const requestInstances: string[] | undefined = this.instances[requestKeyStr]
    // do nothing if there isn't a request
    if (!requestInstances) return
    // TODO: test
    const index: number = requestInstances.indexOf(instanceNum)
    // TODO: test
    requestInstances.splice(index, 1)
    // if it has some other instances then do nothing
    if (requestInstances.length) return
    // else remove the request and state
    // remove request props
    this.removeProps(requestKey)
    // store and event handlers are removed in Requests.ts
  }


  /**
   * Put or replace the latest request props.
   */
  private storeProps(requestKey: RequestKey, props: ActionProps) {
    const [backend, set, action, request] = requestKey

    if (!this.requests[backend]) {
      this.requests[backend] = {}
    }

    if (!this.requests[backend][set]) {
      this.requests[backend][set] = {}
    }

    if (!this.requests[backend][set][action]) {
      this.requests[backend][set][action] = {}
    }

    this.requests[backend][set][action][request] = props
  }

  private removeProps(requestKey: RequestKey) {
    const [backend, set, action, request] = requestKey

    // TODO: надо же еще удалить storage и обработчики

    if (
      this.requests[backend]
      && this.requests[backend][set]
      && this.requests[backend][set][action]
      && this.requests[backend][set][action][request]
    ) {
      delete this.requests[backend][set][action][request]
    }

    if (isEmptyObject(this.requests[backend][set][action])) {
      delete this.requests[backend][set][action]
    }

    if (isEmptyObject(this.requests[backend][set])) {
      delete this.requests[backend][set]
    }

    if (isEmptyObject(this.requests[backend])) {
      delete this.requests[backend]
    }
  }

}
