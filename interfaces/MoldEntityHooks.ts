import HookContext from './HookContext';


type Hook = (context: HookContext) => Promise<void>;

interface MethodHooks {
  all: Hook[];
  find: Hook[];
  get: Hook[];
  create: Hook[];
  update: Hook[];
  patch: Hook[];
  remove: Hook[];
}


export default interface MoldEntityHooks {
  before: MethodHooks;
  after: MethodHooks;
  // TODO: add error hooks ???
}
