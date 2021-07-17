import PouchDB from 'pouchdb'

import {
  DB_ADAPTER_EVENT_TYPES,
  DB_ADAPTER_EVENTS,
  DbAdapter,
  RecordChangeHandler
} from '../../interfaces/DbAdapter'
import {MoldResponse} from '../../interfaces/MoldResponse'
import {
  BatchResponse,
  CreateResponse,
  ItemResponse,
  ListResponse
} from '../../interfaces/ReponseStructure'
import {FindQuery} from '../../interfaces/FindQuery'
import {GetQuery} from '../../interfaces/GetQuery'
import {MoldDocument} from '../../interfaces/MoldDocument'
import {makeUniqId} from 'squidlet-lib/src/uniqId'
import IndexedEventEmitter from 'squidlet-lib/src/IndexedEventEmitter'
import {omitObj} from 'squidlet-lib/src/objects'
import {convertPageToOffset} from '../../helpers/common'
import {
  DeleteSuccess,
  ErrorResponse,
  FindSuccess,
  GetSuccess,
  PouchChangeResult,
  PouchEventEmitter, PouchRecord,
  PutSuccess
} from './interfaces'
import {SET_DELIMITER} from './constants'
import {makeDbId, makeErrorResponse, makeBatchResponse} from './helpers'


export default class PouchDbAdapter implements DbAdapter {
  pouchDb: PouchDB

  private readonly pouchEventEmitter: PouchEventEmitter
  private readonly events = new IndexedEventEmitter()


  constructor(pouchDb: PouchDB) {
    this.pouchDb = pouchDb
    this.pouchEventEmitter = this.pouchDb.changes({
      // listen all the events on once
      live: true,
      // means to listen after init, not to catch init messages.
      since: 'now',
      // this is needs to get an id of doc because the id can be a number.
      include_docs: true,
    })

    this.pouchEventEmitter.on('change', this.handleChange)
    this.pouchEventEmitter.on('error', this.handleError)
  }

  async init() {
    // TODO: поидее нужно ожидать пока выполнится промис db created
    // this.pouchDb.on('created', () => {
    //   // TODO: ожидать создания базы ??? или это выше нужно сделать ???
    // })
  }

  async destroy(): Promise<void> {
    this.events.destroy()
    this.pouchEventEmitter.cancel()
    await this.pouchDb.close()
  }


  async find(set: string, query: FindQuery): Promise<MoldResponse<ListResponse>> {
    let result: FindSuccess

    try {
      result = await this.pouchDb.allDocs({
        include_docs: true,
        startkey: set + SET_DELIMITER,
        endkey: set + SET_DELIMITER + '\ufff0',
        // TODO: вроде это не эффективный способ, нужно наверное view использовать
        ...convertPageToOffset(query.page, query.pageSize),
        ...query,
      })
    }
    catch (e) {
      return makeErrorResponse(e)
    }

    return {
      status: 200,
      success: true,
      errors: null,
      result: {
        // TODO: расчитать все
        count: -1,
        hasNext: false,
        hasPrev: false,
        data: result.rows.map((item): MoldDocument => item.doc as any),
      },
    }
  }

  async get(set: string, query: GetQuery): Promise<MoldResponse<ItemResponse>> {
    let result: GetSuccess

    if (typeof query.id !== 'string' && typeof query.id !== 'number') {
      throw new Error(`Id has to be a string or number`)
    }

    try {
      result = await this.pouchDb.get(
        makeDbId(set, query.id),
        omitObj(query, 'id')
      )
    }
    catch (e) {
      return makeErrorResponse(e)
    }

    return {
      status: 200,
      success: true,
      errors: null,
      result: {
        data: result as any,
      },
    }
  }

  // TODO: наверное сделать put
  async create(
    set: string,
    data: Partial<MoldDocument>,
    query?: Record<string, any>
  ): Promise<MoldResponse<CreateResponse>> {
    let result: PutSuccess;
    const id: string | number = (typeof data.id === 'undefined' || data.id === null)
      ? makeUniqId()
      : data.id;

    try {
      result = await this.pouchDb.put({
        ...data,
        id,
        _id: makeDbId(set, id),
      }, query || {});
    }
    catch (e) {
      return makeErrorResponse(e);
    }

    if (!result.ok) {
      return makeErrorResponse({status: 500});
    }

    return {
      status: 201,
      success: true,
      errors: null,
      result: { id },
    }
  }

  async patch(
    set: string,
    partialData: MoldDocument,
    query?: Record<string, any>
  ): Promise<MoldResponse<null>> {
    if (typeof partialData.id !== 'string' && typeof partialData.id !== 'number') {
      throw new Error(`Id of document has to be set`)
    }

    const fullId = makeDbId(set, partialData.id)
    let getResult: GetSuccess
    // first get full document
    try {
      getResult = await this.pouchDb.get(fullId)
    }
    catch (e) {
      return makeErrorResponse(e)
    }

    let result: PutSuccess

    try {
      result = await this.pouchDb.put({
        ...getResult,
        ...partialData,
        _id: fullId,
      }, query || {})
    }
    catch (e) {
      return makeErrorResponse(e)
    }

    if (!result.ok) {
      return makeErrorResponse({status: 500})
    }

    return {
      status: 204,
      success: true,
      errors: null,
      result: null,
    }
  }

  async delete(
    set: string,
    id: string | number,
    query?: Record<string, any>
  ): Promise<MoldResponse<null>> {
    if (typeof id !== 'string' && typeof id !== 'number') {
      throw new Error(`Id of document has to be set`)
    }

    let getResult: GetSuccess

    try {
      getResult = await this.pouchDb.get(makeDbId(set, id))
    }
    catch (e) {
      return makeErrorResponse(e)
    }

    let result: DeleteSuccess

    try {
      result = await this.pouchDb.remove(getResult, query || {})
    }
    catch (e) {
      return makeErrorResponse(e)
    }

    if (!result.ok) {
      return makeErrorResponse({status: 500})
    }

    return {
      status: 204,
      success: true,
      errors: null,
      result: null,
    }
  }

  async batchCreate(
    set: string,
    docs: Partial<MoldDocument>[],
    query?: Record<string, any>
  ): Promise<MoldResponse<BatchResponse>> {
    const preparedDocs = docs.map((doc) => {
      const id: string | number = (typeof doc.id === 'undefined' || doc.id === null)
        ? makeUniqId()
        : doc.id;

      return {
        ...omitObj(doc, 'id'),
        id,
        _id: makeDbId(set, + id),
      };
    });
    let bulkResult: (PutSuccess | ErrorResponse)[];

    try {
      bulkResult = await this.pouchDb.bulkDocs(
        preparedDocs,
        query || {}
      );
    }
    catch (e) {
      return makeErrorResponse(e);
    }

    return makeBatchResponse(preparedDocs.map(item => item.id), bulkResult);
  }

  async batchPatch(
    set: string,
    docs: MoldDocument[],
    query?: Record<string, any>
  ): Promise<MoldResponse<BatchResponse>> {
    const ids: (string | number)[] = []
    let findResult: FindSuccess

    for (let doc of docs) {
      if (typeof doc.id !== 'string' && typeof doc.id !== 'number') {
        throw new Error(`Document had to have an id: ${JSON.stringify(doc)}`)
      }

      ids.push(doc.id)
    }

    try {
      findResult = await this.pouchDb.allDocs({
        include_docs: true,
        keys: ids.map((docId) => makeDbId(set, docId)),
      })
    }
    catch (e) {
      // TODO: нужно продолжить работать с теми документами которые найденны
      //       остальные считать ошибочными и вернуть в ответе
      return makeErrorResponse(e)
    }

    const preparedDocs: (PouchRecord & MoldDocument)[] = findResult.rows.map((item, index) => ({
      ...item.doc,
      ...docs[index],
    }))
    let bulkResult: (PutSuccess | ErrorResponse)[]

    try {
      bulkResult = await this.pouchDb.bulkDocs(
        preparedDocs,
        query || {}
      )
    }
    catch (e) {
      return makeErrorResponse(e)
    }

    return makeBatchResponse(ids, bulkResult)
  }

  async batchDelete(
    set: string,
    ids: (string | number)[],
    query?: Record<string, any>
  ): Promise<MoldResponse<BatchResponse>> {
    let findResult: FindSuccess

    try {
      findResult = await this.pouchDb.allDocs({
        include_docs: false,
        keys: ids.map((id) => makeDbId(set, id)),
      })
    }
    catch (e) {
      // TODO: нужно продолжить работать с теми документами которые найденны
      //       остальные считать ошибочными и вернуть в ответе
      return makeErrorResponse(e)
    }

    const preparedDocs: PouchRecord[] = findResult.rows.map((item) => ({
      _id: item.id,
      _rev: item.value.rev,
      _deleted : true,
    }))
    let bulkResult: (PutSuccess | ErrorResponse)[]

    try {
      bulkResult = await this.pouchDb.bulkDocs(
        preparedDocs,
        query || {}
      )
    }
    catch (e) {
      return makeErrorResponse(e)
    }

    return makeBatchResponse(ids, bulkResult)
  }

  action(
    set: string,
    actionName: string,
    query?: Record<string, any>,
    data?: Record<string, any>,
  ): Promise<MoldResponse> {
    throw new Error(`PouchDbAdapter: doesn't support custom actions`);
  }


  // async getField(): Promise<void> {
  //   throw new Error(`PouchDbAdapter: doesn't support the getField method`);
  // }
  // async hasField(): Promise<boolean> {
  //   throw new Error(`PouchDbAdapter: doesn't support the hasField method`);
  // }
  // async createField(): Promise<void> {
  //   throw new Error(`PouchDbAdapter: doesn't support the createField method`);
  // }
  // async updateField(): Promise<void> {
  //   throw new Error(`PouchDbAdapter: doesn't support the updateField method`);
  // }
  // async deleteField(): Promise<void> {
  //   throw new Error(`PouchDbAdapter: doesn't support the deleteField method`);
  // }
  //
  // async getSet(): Promise<void> {
  //   throw new Error(`PouchDbAdapter: doesn't support the getSet method`);
  // }
  // async hasSet(): Promise<boolean> {
  //   throw new Error(`PouchDbAdapter: doesn't support the hasSet method`);
  // }
  // async createSet(): Promise<void> {
  //   throw new Error(`PouchDbAdapter: doesn't support the createSet method`);
  // }
  // async renameSet(): Promise<void> {
  //   throw new Error(`PouchDbAdapter: doesn't support the renameSet method`);
  // }
  // async deleteSet(): Promise<void> {
  //   throw new Error(`PouchDbAdapter: doesn't support the deleteSet method`);
  // }


  onChange(cb: RecordChangeHandler): number {
    return this.events.addListener(DB_ADAPTER_EVENTS.change, cb);
  }

  onError(cb: (error: string) => void) {
    return this.events.addListener(DB_ADAPTER_EVENTS.error, cb);
  }

  removeListener(handlerIndex: number) {
    this.events.removeListener(handlerIndex);
  }


  private handleChange = (change: PouchChangeResult) => {
    const [set] = change.id.split(SET_DELIMITER)
    let eventType: DB_ADAPTER_EVENT_TYPES = DB_ADAPTER_EVENT_TYPES.updated

    if (change.deleted) {
      // was deleted
      eventType = DB_ADAPTER_EVENT_TYPES.deleted
    }
    else {
      // else was put
      const [revNum] = change.changes[0].rev.split('-')
      // 1 is the first insert
      if (revNum === '1') eventType = DB_ADAPTER_EVENT_TYPES.created
    }

    this.events.emit(DB_ADAPTER_EVENTS.change, set, change.doc.id, eventType)
  }

  private handleError = (error: string) => {
    // TODO: а ошибка точно строкой выдается?

    // This event is fired when the changes feed is stopped due to an unrecoverable failure.
    this.events.emit(DB_ADAPTER_EVENTS.error, error)
  }

}
