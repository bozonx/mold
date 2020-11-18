import {HookType} from './HookType';
import {MoldHook} from './MoldHooks';


export interface PreHookDefinition {
  readonly type: HookType;
  // action like find, get, ... or some custom.
  // Action "all" will be called inside all the action branches
  readonly action: string;
  readonly hook: MoldHook;
}

export type SetHooks = (PreHookDefinition | PreHookDefinition[])[];
export type SetsDefinition = {[index: string]: SetHooks;
