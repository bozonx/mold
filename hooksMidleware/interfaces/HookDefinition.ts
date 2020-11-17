import {HookType} from './HookType';
import {MoldHook} from './MoldHooks';


export interface HookDefinition {
  readonly type: HookType;
  readonly set: string;
  readonly hook: MoldHook;
}
