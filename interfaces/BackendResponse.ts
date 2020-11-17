import {JsonData} from './Types';


export interface ResponseError {
  code: number;
  // it isn't required for standard messages which will be translated.
  message?: string;
}


export default interface BackendResponse {
  // status of response: 200, 400, 500 etc or some custom
  status: number;
  // true if request was success and false if wasn't - an error
  success: boolean;
  // some errors which the backend sent instead result.
  errors: ResponseError[] | null;
  // null if no body or error occurred
  result: JsonData | null;
}
