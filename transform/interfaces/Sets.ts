import {MoldHook} from './MoldHook'


export interface Sets {
  // special sets. They are run on each set
  beforeHooks: MoldHook[]
  beforeRequest: MoldHook[]
  afterRequest: MoldHook[]
  afterHooks: MoldHook[]
  // set which will be called before request
  // like { setName: { actionName: [ ...hookCb() ] } }
  setsAfter: Record<string, Record<string, MoldHook[]>>
  // set which will be called after request
  setsBefore: Record<string, Record<string, MoldHook[]>>
}
