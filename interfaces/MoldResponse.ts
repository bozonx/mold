import {MoldErrorDefinition} from './MoldErrorDefinition';


export interface MoldResponse<T = any> {
  // status of response: 200, 400, 500 etc or some custom
  status: number;
  // true if request was success and false if wasn't - an error
  success: boolean;
  // some errors which the backend sent instead of result.
  errors: MoldErrorDefinition[] | null;
  // null if no body or in case when error occurred. Null while loading or saving
  result: T | null;
}
