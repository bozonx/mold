import {HookContext} from './HookContext';
import {HookType} from './HookType';


/**
 * Should throw a `new Error()` on fatal.
 */
export type MoldHook = (context: HookContext) => Promise<void>;

export interface PreHookDefinition {
  readonly type: HookType;
  // action like find, get, ... or some custom.
  // Action "all" will be called with all the action branches
  // Don't set it for special hook types
  readonly action?: string;
  // hook callback itself
  readonly hook: MoldHook;
}

export type SetItem = PreHookDefinition | PreHookDefinition[];
// This is raw sets definition which is defined at the application.
// like { setName: [...hooks]}. Set name can be special like beforeHooks, error etc
export type SetsDefinition = {[index: string]: SetItem[]};
