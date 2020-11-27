import Mold from './Mold';
import {PushMessage} from '../interfaces/PushMessage';


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
