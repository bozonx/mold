import HookContext from './HookContext';


export type MoldHook = (context: HookContext) => Promise<void>;
