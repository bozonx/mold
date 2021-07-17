export interface PouchRecord {
  _id: string
  _rev: string
  [index: string]: any
}

export interface FindSuccess {
  offset: number
  length: number
  // the total number of ALL! non-deleted documents in the database
  total_rows: number
  rows: {
    // full id in db
    id: string
    key: string
    value: {rev: string}
    doc: PouchRecord
  }[]
}

export type GetSuccess = PouchRecord;

export interface PutSuccess {
  id: string
  ok: boolean
  rev: string
}

export type DeleteSuccess = PutSuccess;

export interface ErrorResponse {
  // it seems that it always true
  error: boolean
  // full message
  message: string
  // status unique name such as not_found
  name: string
  // status text
  reason: string
  // like 404
  status: number
}

export interface PouchChangeResult {
  // full id of document
  id: string
  changes: {rev: string}[]
  deleted?: boolean
  seq: number
  doc: Record<string, any>
}

export interface PouchEventEmitter {
  cancel()
  on(eventName: 'change', cb: (change: PouchChangeResult) => void)
  on(eventName: 'error', cb: (error: string) => void)
}
