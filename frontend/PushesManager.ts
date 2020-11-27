import Mold from './Mold';
import {PUSH_MESSAGE_POSITIONS, PushMessage} from '../interfaces/PushMessage';
import {ActionProps} from './interfaces/ActionProps';
import {ActionState} from './interfaces/ActionState';
import {RequestKey} from './interfaces/RequestKey';


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

    console.log(5555555555, backend, message);

    const set = message[PUSH_MESSAGE_POSITIONS.set];

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


        }

        console.log(6666, actionName, requests)
      }
    );

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
