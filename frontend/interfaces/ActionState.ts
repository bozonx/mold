import {MoldResponse} from '../../interfaces/MoldResponse'


// TODO: зачем убирать success и status ?
export interface ActionState<T = any>
  extends Omit<Omit<MoldResponse<T>, 'success'>, 'status'>
{
  // it is loading or saving first time or further at the moment
  pending: boolean
  // loaded or saved at least once or it is in a cache
  finishedOnce: boolean
  // success, status, errors, result - for the last response
  success: boolean | null
  status: number | null
}
