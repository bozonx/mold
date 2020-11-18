import {HookType} from './HookType';
import {MoldHook} from './MoldHooks';


export interface PreHookDefinition {
  readonly type: HookType | HookType[];
  // action like find, get, ... or some custom.
  // Action "all" will be called inside all the action branches
  readonly action: string | string[];
  readonly hook: MoldHook | MoldHook[];
}
