import {HookContext} from './HookContext';
import {HookType} from './HookType';


/**
 * It it throws a `new Error()` then code will be -2 means fatal.
 * If to throws a `new MoldError()` then its code will be used ad response status.
 */
export type MoldHook = (context: HookContext) => Promise<void>;

export interface PreHookDefinition {
  readonly type: HookType;
  // action like find, get, ... or some custom.
  // Action "all" will be called with all the action branches
  readonly action: string;
  readonly hook: MoldHook;
}

export type SetItem = PreHookDefinition | PreHookDefinition[];
// This is raw sets definition which is defined at the application.
// like { setName: [...hooks]}. Set name can be special like beforeHooks, error etc
export type SetsDefinition = {[index: string]: SetItem[]};
