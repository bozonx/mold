_ = require('lodash')
helpers = require('../src/helpers')

generateRequest = (pathToDoc, method, toExtend) ->
  _.defaultsDeep(toExtend, {
    moldPath: pathToDoc
    driverRoot: 'root'
    # TODO: url то source
    url: helpers.convertFromLodashToUrl(_.trimStart(pathToDoc, 'root'))
    method: method
  })

cleanPromise = (promise) ->
  return promise.then (resp) ->
    delete resp.driverResponse
    if (_.isArray(resp.body))
      return _.defaults({
        # TODO: плохо что не проверяем id - он разный у pounch and memory
        body: _.map resp.body, (item) =>
          _.omit(item, '_id', '_rev', 'id')
      }, resp)
    else if (_.isPlainObject(resp.body))
      return _.defaults({
        body: _.omit(resp.body, '_id', '_rev', 'id')
      }, resp)
    return resp

module.exports =
  document_get: (mold, pathToDoc, done) ->
    payload =
      booleanParam: true
      stringParam: 'newValue'
      numberParam: 5
      arrayParam: ['value1']
    request = generateRequest(pathToDoc, 'get', {nodeType: 'container'})

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
    request = generateRequest(pathToDoc, 'put', {nodeType: 'container', payload: payload})
    document = mold.child(pathToDoc)
    document.update(payload)

    promise = cleanPromise( document.put() )
    expect(promise).to.eventually.deep.equal({body: payload, request: request}).notify(done)

  document_patch: (mold, pathToDoc, done) ->
    # TODO: пересмотреть
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
    request = generateRequest(pathToDoc, 'patch', {nodeType: 'container', payload: updatedData})

    document.update(firstData)
    expect(document.put()).to.eventually.notify =>
      document.update(updatedData)
      promise = cleanPromise( document.patch() )
      expect(promise).to.eventually.deep.equal({body: resultData, request: request})
      .notify(done)

  documentsCollection_create: (mold, pathToDocColl, done) ->
    collection = mold.child(pathToDocColl)
    payload =
      name: 'value'
    request = generateRequest(pathToDocColl, 'create', {
      nodeType: 'collection', payload: payload, primaryKeyName: 'id'})

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
          nodeType: 'collection', primaryKeyName: 'id', payload: {id: collection.mold.pages[0][0].id}})
        deletePromise = collection.deleteDocument({id: collection.mold.pages[0][0].id})
        expect(deletePromise).to.eventually.notify =>
          loadPromise = cleanPromise( collection.load(0) )

          expect(Promise.all([
            expect(deletePromise).to.eventually.property('request').deep.equal(request),
            expect(loadPromise).to.eventually.property('body').deep.equal([{name: 'value2'}]),
          ])).to.eventually.notify(done)

  documentsCollection_filter: (mold, pathToDocColl, done) ->
    # TODO: не особо нужно
    collection = mold.child(pathToDocColl)
    request = generateRequest(pathToDocColl, 'filter', {
      nodeType: 'collection', primaryKeyName: 'id'
      meta: {pageNum: 0}
    })
    earlyItem = {
      name: 'value'
      created: parseInt(moment().format('x'))
    }
    olderItem = {
      name: 'value'
      created: parseInt(moment().format('x')) + 10000
    }

    expect(collection.create(earlyItem)).to.eventually.notify =>
      expect(collection.create(olderItem)).to.eventually.notify =>
        promise = cleanPromise( collection.load(0) )
        expect(promise).to.eventually
        .deep.equal({body: [earlyItem, olderItem], request: request})
        .notify(done)

  documentsCollection_filter_paged: (mold, pathToDocColl, done) ->
    collection = mold.child(pathToDocColl)
    collection.perPage = 2
    request = generateRequest(pathToDocColl, 'filter', {
      nodeType: 'collection', primaryKeyName: 'id'
      meta: {
        pageNum: 1,
        perPage: 2,
      }
    })
    item0 = { name: 'item0', created: parseInt(moment().format('x')) }
    item1 = { name: 'item1', created: parseInt(moment().format('x')) + 10000 }
    item2 = { name: 'item2', created: parseInt(moment().format('x')) + 20000 }
    item3 = { name: 'item3', created: parseInt(moment().format('x')) + 30000 }

    expect(collection.create(item0)).to.eventually.notify =>
      expect(collection.create(item1)).to.eventually.notify =>
        expect(collection.create(item2)).to.eventually.notify =>
          expect(collection.create(item3)).to.eventually.notify =>
            promise = cleanPromise( collection.load(1) )
            expect(promise).to.eventually
            .deep.equal({body: [
              item2,
              item3,
            ], request: request, meta: {lastPage: true, pageNum: 1}})
            .notify(done)
