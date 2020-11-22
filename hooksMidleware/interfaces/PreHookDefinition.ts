import {HookType} from './HookType';
import {MoldHook} from './MoldHooks';


export interface PreHookDefinition {
  readonly type: HookType;
  // action like find, get, ... or some custom.
  // Action "all" will be called with all the action branches
  readonly action: string;
  readonly hook: MoldHook;
}

export type SetsDefinitionItem = (PreHookDefinition | PreHookDefinition[]);
// This is raw sets definition which is defined at the application.
// like { setName: [...hooks]}. Set name can be special like beforeHooks, error etc
export type SetsDefinition = {[index: string]: SetsDefinitionItem[]};
