export const SPECIAL_HOOKS = [
  'beforeHooks',
  'beforeRequest',
  'afterRequest',
  'afterHooks',
  'error',
]

export type SpecialSet = 'beforeHooks'
  | 'beforeRequest'
  | 'afterRequest'
  | 'afterHooks'
  | 'error';
