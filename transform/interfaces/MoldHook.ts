import {HookContext} from './HookContext'
import {BaseHookTypes} from './HookType'


/**
 * Should throw a `new Error()` on fatal.
 */
export type MoldHook = (context: HookContext) => Promise<void>

export interface PreHookDefinition {
  // before or after
  readonly type: BaseHookTypes
  // action like find, get, ... or some custom.
  // Action "all" will be called with all the action branches
  readonly action: string
  // hook callback itself
  readonly hook: MoldHook
}

// This is raw sets definition which is defined at the application.
// like { setName: [...hooks]}. Set name can be special like beforeHooks, error etc
export type SetsDefinition = {[index: string]: PreHookDefinition[][]}
