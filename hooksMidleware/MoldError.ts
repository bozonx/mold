import {MoldErrorDefinition} from '../interfaces/MoldErrorDefinition';


export class MoldError implements MoldErrorDefinition {
  readonly code: number;
  readonly message?: string;


  constructor(code: number, message?: string) {
    this.code = code;
    this.message = message;
  }
}
