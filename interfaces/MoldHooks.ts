import HookContext from './HookContext';


export type MoldHook = (context: HookContext) => Promise<void>;

// interface MethodHooks {
//   all?: Hook[];
//   find?: Hook[];
//   get?: Hook[];
//   create?: Hook[];
//   update?: Hook[];
//   patch?: Hook[];
//   remove?: Hook[];
// }


// export default interface MoldEntityHooks {
//   before?: MoldHook[];
//   after?: MoldHook[];
//   // TODO: add error hooks ???
// }
