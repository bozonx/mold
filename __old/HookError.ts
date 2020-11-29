import {MoldErrorDefinition} from '../interfaces/MoldErrorDefinition';


export class HookError implements MoldErrorDefinition {
  readonly code: number;
  readonly message?: string;


  constructor(code: number, message?: string) {
    this.code = code;
    this.message = message;
  }

  toPlainObject(): MoldErrorDefinition {
    return { code: this.code, message: this.message };
  }

  toString(): string {
    return `${this.code}: ${this.message || 'Unknown error'}`;
  }

}
