import Mold from './Mold';
import {PushMessage} from '../interfaces/PushMessage';
import {ActionProps} from './interfaces/ActionProps';
import {ActionState} from './interfaces/ActionState';
import {RequestKey} from './interfaces/RequestKey';
import {DB_ADAPTER_EVENT_TYPES} from '../interfaces/DbAdapter';
import {ItemResponse, ListResponse} from '../interfaces/ReponseStructure';


export type PushIncomeMessage = string | PushMessage | PushMessage[];


export default class PushesManager {
  private readonly mold: Mold;


  constructor(mold: Mold) {
    this.mold = mold;
  }

  destroy() {
  }


  incomePush(backend: string, message: PushIncomeMessage) {
    const validMessages: PushMessage[] = this.parseMessage(message);

    for (let item of validMessages) {
      this.handleMessage(backend, item);
    }
  }


  private handleMessage(backend: string, message: PushMessage) {

    // TODO: наверное стоит сделать мини дебаунс на текущий тик

    const [set, id, type] = message;

    this.mold.requests.instances.eachAction(
      backend,
      set,
      (actionName: string, requests: {[index: string]: ActionProps}) => {
        for (let requestId of Object.keys(requests)) {
          const actionProps: ActionProps = requests[requestId];
          // don't update saving requests
          if (!actionProps.isReading) continue;

          const requestKey: RequestKey = [backend, set, actionName, requestId];
          const state: ActionState | undefined = this.mold.storageManager.getState(
            requestKey
          );

          if (!state) continue;

          const needUpdate: boolean = this.doesStateNeedUpdate(state, id, type);

          if (!needUpdate) continue;

          this.mold.requests.rerunRequest(actionProps)
            .catch(this.mold.log.error);
        }
      }
    );
  }

  private doesStateNeedUpdate(
    state: ActionState<ListResponse | ItemResponse>,
    itemId: string | number,
    eventType: DB_ADAPTER_EVENT_TYPES,
  ): boolean {
    // TODO: test by hard
    if (eventType === DB_ADAPTER_EVENT_TYPES.created || eventType === DB_ADAPTER_EVENT_TYPES.deleted) {
      // make new requests for all the lists
      // skip standalone requests event on delete event.
      if (Array.isArray(state.result?.data)) return true;
    }
    // else updated - make requests only for lists which includes this element
    // and make requests for standalone elements with this id.
    if (Array.isArray(state.result?.data)) {
      for (let item of state.result!.data) {
        if (typeof item === 'object' && item.id === itemId) {
          return true;
        }
      }
    }
    else if (typeof state.result?.data === 'object' && state.result?.data?.id === itemId) {
      return true;
    }

    return false;
  }

  private parseMessage(message: PushIncomeMessage): PushMessage[] {
    const result: PushMessage[] = [];

    if (typeof message === 'string') {
      let result: any;

      try {
        result = JSON.parse(message);
      }
      catch (e) {
        throw new Error(`Can't parse json push message: "${JSON.stringify(message)}". ${e}`);
      }

      this.parseMessage(result);
    }
    else if (Array.isArray(message[0])) {
      for (let item of message) {
        const pushMsg = item as PushMessage;

        this.validateMessage(pushMsg);

        result.push(pushMsg);
      }
    }
    else if (typeof message[0] === 'string') {
      const pushMsg = message as PushMessage;

      this.validateMessage(pushMsg);

      result.push(pushMsg);
    }
    else {
      throw new Error(`Can't parse push message: "${JSON.stringify(message)}"`)
    }

    return result;
  }

  private validateMessage(message: PushMessage) {
    if (message.length !== 3) {
      throw new Error(`Incorrect push message ${JSON.stringify(message)}`);
    }
    else if (typeof message[0] !== 'string') {
      throw new Error(`Incorrect the "set" param push message ${JSON.stringify(message)}`);
    }
    else if (typeof message[1] !== 'string' && typeof message[1] !== 'number') {
      throw new Error(`Incorrect the "id" param of push message ${JSON.stringify(message)}`);
    }
    else if (typeof message[2] !== 'number') {
      throw new Error(
        `Incorrect then "type" param of push message ${JSON.stringify(message)}`
      );
    }
  }

}
