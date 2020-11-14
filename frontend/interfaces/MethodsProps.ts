// TODO: use JSON primitives


interface PropsBase {
  // name of entity which is queried
  entity: string,
  // data like in search part of url
  query?: {[index: string]: any},
  // hidden specific data
  meta?: {[index: string]: any}
}

interface SavingBase extends PropsBase {
  // data to save
  data: {[index: string]: any};
}


export interface FindProps extends PropsBase {
  pageNum?: number,
  perPage?: number,
}

export interface GetItemProps extends PropsBase {
  id: string | number,
}

export interface GetFirstProps extends PropsBase {
}

export interface CreateProps extends SavingBase {
}

export interface UpdateProps extends SavingBase {
  id: string | number,
  // data can include id or not - it doesn't matter
}

export interface CreateOrUpdateProps extends SavingBase {
  id?: string | number,
  // data can include id or not - it doesn't matter
}

export interface DeleteProps extends PropsBase {
  id: string | number,
}
