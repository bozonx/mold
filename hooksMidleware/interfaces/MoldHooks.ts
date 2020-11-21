import {HookContext} from './HookContext';


/**
 * It it throws a `new Error()` then code will be -2 means fatal.
 * If to throws a `new MoldError()` then its code will be used ad response status.
 */
export type MoldHook = (context: HookContext) => Promise<void>;
