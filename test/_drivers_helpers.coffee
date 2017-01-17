_ = require('lodash')
helpers = require('../src/helpers')

generateRequest = (pathToDoc, method, toExtend) ->
  _.defaultsDeep(toExtend, {
    moldPath: pathToDoc
    driverRoot: 'root'
    url: helpers.convertFromLodashToUrl(_.trimStart(pathToDoc, 'root'))
    method: method
  })

cleanPromise = (promise) ->
  return promise.then (resp) ->
    delete resp.driverResponse
    if (_.isArray(resp.body))
      return _.defaults({
        # TODO: плохо что не проверяем id - он разный у pouch and memory
        body: _.map resp.body, (item) =>
          _.omit(item, '_id', '_rev', 'id', '$url', '$id', '$parent')
      }, resp)
    else if (_.isPlainObject(resp.body))
      return _.defaults({
        body: _.omit(resp.body, '_id', '_rev', 'id', '$url', '$id', '$parent')
      }, resp)
    return resp

module.exports =
  document_get: (mold, pathToDoc, done) ->
    payload =
      booleanParam: true
      stringParam: 'newValue'
      numberParam: 5
      arrayParam: ['value1']
    request = generateRequest(pathToDoc, 'get', {})

    document = mold.child(pathToDoc)
    document.update(payload)
    expect(document.put()).to.eventually.notify =>
      promise = cleanPromise( document.load() )
      expect(promise).to.eventually
      .deep.equal({body: payload, request: request}).notify(done)

  document_get_error: (mold, pathToDoc, done) ->
    err = ['driverError', 'request']
    document = mold.child(pathToDoc)
    document.load()
      .then () =>
        throw new Error('it was fulfilled')
      .catch (errResp) =>
        expect(Promise.resolve(_.keys(errResp))).to.eventually
        .deep.equal(err)
        .notify(done)

  document_put: (mold, pathToDoc, done) ->
    payload =
      booleanParam: true
      stringParam: 'newValue'
      numberParam: 5
      arrayParam: ['value1']
    request = generateRequest(pathToDoc, 'put', {payload: payload})
    document = mold.child(pathToDoc)

    promise = cleanPromise( document.put(payload) )
    expect(promise).to.eventually.deep.equal({body: payload, request: request}).notify(done)

  document_patch: (mold, pathToDoc, done) ->
    firstData =
      booleanParam: true
      stringParam: 'oldValue'
      numberParam: 5
      arrayParam: ['value1', 'value2']
    updatedData =
      stringParam: 'newValue'
      arrayParam: ['value3']
    resultData = _.defaults(_.clone(updatedData), firstData)
    document = mold.child(pathToDoc)
    request = generateRequest(pathToDoc, 'patch', {payload: updatedData})

    expect(document.put(firstData)).to.eventually.notify =>
      promise = cleanPromise( document.patch(updatedData) )
      expect(promise).to.eventually.deep.equal({body: resultData, request: request})
      .notify(done)

  documentsCollection_create: (mold, pathToDocColl, done) ->
    collection = mold.child(pathToDocColl)
    payload =
      name: 'value'
    request = generateRequest(pathToDocColl, 'create', {
      payload: payload, primaryKeyName: 'id'})

    promise = cleanPromise( collection.create(payload) )
    expect(promise).to.eventually.deep.equal({body: {name: 'value'}, request: request}).notify(done)

  documentsCollection_delete: (mold, pathToDocColl, done) ->
    collection = mold.child(pathToDocColl)

    item1 = {name: 'value1'}
    item2 = {name: 'value2'}
    collection.push(item1)
    collection.push(item2)
    expect(collection.create(item1)).to.eventually.notify =>
      expect(collection.create(item2)).to.eventually.notify =>
        request = generateRequest(pathToDocColl, 'delete', {
          primaryKeyName: 'id', payload: {id: collection.mold[0][0].id}})
        deletePromise = collection.remove(_.pick(collection.mold[0][0], 'id', '$pageIndex', '$index'))
        expect(deletePromise).to.eventually.notify =>
          loadPromise = cleanPromise( collection.load(0) )

          expect(Promise.all([
            expect(deletePromise).to.eventually.property('request').deep.equal(request),
            expect(loadPromise).to.eventually.property('body').deep.equal([{name: 'value2'}]),
          ])).to.eventually.notify(done)

#  documentsCollection_filter: (mold, pathToDocColl, done) ->
#    # не особо нужно - уже проверяется в documentsCollection_filter_paged
#    collection = mold.child(pathToDocColl)
#    request = generateRequest(pathToDocColl, 'filter', {
#      nodeType: 'collection', primaryKeyName: 'id'
#      meta: {pageNum: 0}
#    })
#    earlyItem = {
#      name: 'value'
#      created: parseInt(moment().format('x'))
#    }
#    olderItem = {
#      name: 'value'
#      created: parseInt(moment().format('x')) + 10000
#    }
#
#    expect(collection.create(earlyItem)).to.eventually.notify =>
#      expect(collection.create(olderItem)).to.eventually.notify =>
#        promise = cleanPromise( collection.load(0) )
#        expect(promise).to.eventually
#        .deep.equal({body: [earlyItem, olderItem], request: request})
#        .notify(done)

  documentsCollection_filter_paged: (mold, pathToDocColl, done) ->
    collection = mold.child(pathToDocColl)
    collection.perPage = 2
    request = generateRequest(pathToDocColl, 'filter', {
      primaryKeyName: 'id'
      meta: {
        pageNum: 1,
        perPage: 2,
      }
    })
    item0 = { name: 'item0', created: parseInt(moment().format('x')) }
    item1 = { name: 'item1', created: parseInt(moment().format('x')) + 10000 }
    item2 = { name: 'item2', created: parseInt(moment().format('x')) + 20000 }

    # TODO: так как в pouch.find() не возвращается total_rows
    # - то если последняя страница заполненна полностью, она вернет isLast = false,
    # а последней страницей станет следующая полностью пустая

    expect(collection.create(item0)).to.eventually.notify =>
      expect(collection.create(item1)).to.eventually.notify =>
        expect(collection.create(item2)).to.eventually.notify =>
            promise = cleanPromise( collection.load(1) )
            expect(promise).to.eventually
            .deep.equal({body: [
              item2,
            ], request: request, meta: {lastPage: true, pageNum: 1}})
            .notify(done)
