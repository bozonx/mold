_ = require('lodash')
helpers = require('../src/helpers')

generateRequest = (pathToDoc, method, toExtend) ->
  _.defaultsDeep(toExtend, {
    storagePath: pathToDoc
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
          nodeType: 'collection', primaryKeyName: 'id', payload: {id: collection.mold[0][0].id}})
        deletePromise = collection.deleteDocument({id: collection.mold[0][0].id})
        expect(deletePromise).to.eventually.notify =>
          loadPromise = cleanPromise( collection.load(0) )

          expect(Promise.all([
            expect(deletePromise).to.eventually.property('request').deep.equal(request),
            expect(loadPromise).to.eventually.property('body').deep.equal([{name: 'value2'}]),
          ])).to.eventually.notify(done)

  documentsCollection_filter: (mold, pathToDocColl, done) ->
    collection = mold.child(pathToDocColl)
    request = generateRequest(pathToDocColl, 'filter', {
      nodeType: 'collection', primaryKeyName: 'id'
      meta: {pageNum: 0}
    })
    earlyItem = {
      name: 'value'
      created: moment().format('x')
    }
    olderItem = {
      name: 'value'
      created: moment().format('x') + 10000
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
      meta: {pageNum: 1, perPage: 2}
    })

    expect(collection.create({name: 'item0'})).to.eventually.notify =>
      expect(collection.create({name: 'item1'})).to.eventually.notify =>
        expect(collection.create({name: 'item2'})).to.eventually.notify =>
          expect(collection.create({name: 'item3'})).to.eventually.notify =>
            promise = cleanPromise( collection.load(1) )
            expect(promise).to.eventually
            .deep.equal({body: [
              {name: 'item2'}
              {name: 'item3'}
            ], request: request})
            .notify(done)










#
#####################################
#  container_get: (mold, pathToDoc, done) ->
#    driverInstance = mold.$$schemaManager.getDriver(pathToDoc)
#
#    setRequest = generateRequest(pathToDoc, 'set', {
#      payload:
#        booleanParam: true
#        stringParam: 'new value'
#        numberParam: 5
#        arrayParam: ['value1']
#    })
#
#    getRequest = generateRequest(pathToDoc, 'get')
#
#    expect(driverInstance.startRequest(setRequest)).to.eventually.notify =>
#      promise = driverInstance.startRequest(getRequest).then (resp) ->
#        _.defaults({
#          body: _.omit(resp.body, '_id', '_rev')
#        }, resp)
#
#      expect(Promise.all([
#        expect(promise).to.eventually.property('body').deep.equal(setRequest.payload),
#        expect(promise).to.eventually.property('request').deep.equal(getRequest),
#      ])).to.eventually.notify(done)
#
#  container_set: (mold, pathToDoc, done) ->
#    driverInstance = mold.$$schemaManager.getDriver(pathToDoc)
#
#    setRequest = generateRequest(pathToDoc, 'set', {
#      payload:
#        booleanParam: true
#        stringParam: 'new value'
#        numberParam: 5
#        arrayParam: ['value1']
#    })
#
#    promise = driverInstance.startRequest(setRequest).then (resp) ->
#      _.defaults({
#        body: _.omit(resp.body, '_id', '_rev')
#      }, resp)
#
#    expect(Promise.all([
#      expect(promise).to.eventually.property('body').deep.equal(setRequest.payload),
#      expect(promise).to.eventually.property('request').deep.equal(setRequest),
#    ])).to.eventually.notify(done)
#
#  collection_filter: (mold, pathToDoc, done) ->
#    driverInstance = mold.$$schemaManager.getDriver(pathToDoc)
#
#    # create one
#    addOneRequest = generateRequest(pathToDoc, 'create', {
#      primaryKeyName: 'id'
#      payload:
#        name: 'name1'
#    })
#
#    expect(driverInstance.startRequest(addOneRequest)).to.eventually.notify =>
#      # get all
#      filterRequest = generateRequest(pathToDoc, 'filter')
#      promise = driverInstance.startRequest(filterRequest).then (resp) ->
#        _.defaults({
#          body: _.map(resp.body, (value) => _.omit(value, '_id', '_rev'))
#        }, resp)
#
#      expect(Promise.all([
#        expect(promise).to.eventually.property('body').deep.equal([{id: 0, name: 'name1'}]),
#        expect(promise).to.eventually.property('request').deep.equal(filterRequest),
#      ])).to.eventually.notify(done)
#
#  collection_add: (mold, pathToDoc, done) ->
#    driverInstance = mold.$$schemaManager.getDriver(pathToDoc)
#
#    addRequest = generateRequest(pathToDoc, 'create', {
#      primaryKeyName: 'id'
#      payload:
#        name: 'name1'
#    })
#
#    promise = driverInstance.startRequest(addRequest).then (resp) ->
#      _.defaults({
#        body: _.omit(resp.body, '_id', '_rev')
#      }, resp)
#
#    expect(Promise.all([
#      expect(promise).to.eventually.property('body').deep.equal({id: 0, name: 'name1'}),
#      expect(promise).to.eventually.property('request').deep.equal(addRequest),
#    ])).to.eventually.notify(done)
#
#  collection_remove: (mold, pathToDoc, done) ->
#    driverInstance = mold.$$schemaManager.getDriver(pathToDoc)
#
#    # add one
#    addOneRequest = generateRequest(pathToDoc, 'create', {
#      primaryKeyName: 'id'
#      payload:
#        name: 'name1'
#    })
#    expect(driverInstance.startRequest(addOneRequest)).to.eventually.notify =>
#      # add two
#      addTwoRequest = generateRequest(pathToDoc, 'create', {
#        primaryKeyName: 'id'
#        payload:
#          name: 'name2'
#      })
#      expect(driverInstance.startRequest(addTwoRequest)).to.eventually.notify =>
#        # remove first
#        removeRequest = generateRequest(pathToDoc, 'delete', {
#          primaryKeyName: 'id'
#          payload:
#            id: 0
#        })
#        expect(driverInstance.startRequest(removeRequest)).to.eventually.notify =>
#          # get all
#          filterRequest = generateRequest(pathToDoc, 'filter', {primaryKeyName: 'id'})
#          promise = driverInstance.startRequest(filterRequest).then (resp) ->
#            _.defaults({
#              body: _.map(resp.body, (value) => _.omit(value, '_id', '_rev'))
#            }, resp)
#
#          expect(Promise.all([
#            expect(promise).to.eventually.property('body').deep.equal([{id: 1, name: 'name2'}]),
#            expect(promise).to.eventually.property('request').deep.equal(filterRequest),
#          ])).to.eventually.notify(done)
