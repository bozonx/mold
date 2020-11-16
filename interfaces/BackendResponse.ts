import {JsonData} from './Types';


export interface ResponseError {
  code: number;
  message: string;
}


export default interface BackendResponse {
  // status of request: 200, 400, 500 etc or custom
  status: number;
  // some errors which the backend sent instead result.
  errors: ResponseError[] | null;
  result: JsonData | null;
}
