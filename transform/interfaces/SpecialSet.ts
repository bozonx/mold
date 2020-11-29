export const SPECIAL_HOOKS = [
  'beforeHooks',
  'beforeRequest',
  'afterRequest',
  'afterHooks',
  'fatalError',
]

export type SpecialSet = 'beforeHooks'
  | 'beforeRequest'
  | 'afterRequest'
  | 'afterHooks'
  | 'fatalError';
