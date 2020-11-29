import {MoldHook} from './MoldHook';


export interface Sets {
  // special sets
  beforeHooks: MoldHook[];
  beforeRequest: MoldHook[];
  afterRequest: MoldHook[];
  afterHooks: MoldHook[];
  error: MoldHook[];
  // set which will be called before request
  // like { setName: { actionName: [ ...hookCb() ] } }
  setsAfter: {[index: string]: {[index: string]: MoldHook[]}};
  // set which will be called after request
  setsBefore: {[index: string]: {[index: string]: MoldHook[]}};
}
