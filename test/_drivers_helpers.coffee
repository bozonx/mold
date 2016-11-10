_ = require('lodash')
helpers = require('../src/helpers')

generateRequest = (pathToDoc, method, toExtend) ->
  _.defaultsDeep(toExtend, {
    storagePath: pathToDoc
    driverPath:
      document: pathToDoc
      full: pathToDoc
    document: { pathToDocument: pathToDoc }
    method: method
    primaryKeyName: 'id'
  })

module.exports =
  container_get: (mold, pathToDoc, done) ->
    driverInstance = mold.$$schemaManager.getDriver(pathToDoc)

    setRequest = generateRequest(pathToDoc, 'set', {
      payload:
        booleanParam: true
        stringParam: 'new value'
        numberParam: 5
        arrayParam: ['value1']
    })

    getRequest = generateRequest(pathToDoc, 'get')

    expect(driverInstance.startRequest(setRequest)).to.eventually.notify =>
      promise = driverInstance.startRequest(getRequest).then (resp) ->
        _.defaults({
          body: _.omit(resp.body, '_id', '_rev')
        }, resp)

      expect(Promise.all([
        expect(promise).to.eventually.property('body').deep.equal(setRequest.payload),
        expect(promise).to.eventually.property('request').deep.equal(getRequest),
      ])).to.eventually.notify(done)

  container_set: (mold, pathToDoc, done) ->
    driverInstance = mold.$$schemaManager.getDriver(pathToDoc)

    setRequest = generateRequest(pathToDoc, 'set', {
      payload:
        booleanParam: true
        stringParam: 'new value'
        numberParam: 5
        arrayParam: ['value1']
    })

    promise = driverInstance.startRequest(setRequest).then (resp) ->
      _.defaults({
        body: _.omit(resp.body, '_id', '_rev')
      }, resp)

    expect(Promise.all([
      expect(promise).to.eventually.property('body').deep.equal(setRequest.payload),
      expect(promise).to.eventually.property('request').deep.equal(setRequest),
    ])).to.eventually.notify(done)

  collection_filter: (mold, pathToDoc, done) ->
    driverInstance = mold.$$schemaManager.getDriver(pathToDoc)

    # add one
    addOneRequest = generateRequest(pathToDoc, 'add', {
      payload:
        name: 'name1'
    })

    expect(driverInstance.startRequest(addOneRequest)).to.eventually.notify =>
      # get all
      filterRequest = generateRequest(pathToDoc, 'filter')
      promise = driverInstance.startRequest(filterRequest).then (resp) ->
        _.defaults({
          body: _.map(resp.body, (value) => _.omit(value, '_id', '_rev'))
        }, resp)

      expect(Promise.all([
        expect(promise).to.eventually.property('body').deep.equal([{id: 0, name: 'name1'}]),
        expect(promise).to.eventually.property('request').deep.equal(filterRequest),
      ])).to.eventually.notify(done)

  collection_add: (mold, pathToDoc, done) ->
    driverInstance = mold.$$schemaManager.getDriver(pathToDoc)

    addRequest = generateRequest(pathToDoc, 'add', {
      payload:
        name: 'name1'
    })

    promise = driverInstance.startRequest(addRequest).then (resp) ->
      _.defaults({
        body: _.omit(resp.body, '_id', '_rev')
      }, resp)

    expect(Promise.all([
      expect(promise).to.eventually.property('body').deep.equal({id: 0, name: 'name1'}),
      expect(promise).to.eventually.property('request').deep.equal(addRequest),
    ])).to.eventually.notify(done)

  collection_remove: (mold, pathToDoc, done) ->
    driverInstance = mold.$$schemaManager.getDriver(pathToDoc)

    # add one
    addOneRequest = generateRequest(pathToDoc, 'add', {
      payload:
        name: 'name1'
    })
    expect(driverInstance.startRequest(addOneRequest)).to.eventually.notify =>
      # add two
      addTwoRequest = generateRequest(pathToDoc, 'add', {
        payload:
          name: 'name2'
      })
      expect(driverInstance.startRequest(addTwoRequest)).to.eventually.notify =>
        # remove first
        removeRequest = generateRequest(pathToDoc, 'remove', {
          payload:
            id: 0
        })
        expect(driverInstance.startRequest(removeRequest)).to.eventually.notify =>
          # get all
          filterRequest = generateRequest(pathToDoc, 'filter')
          promise = driverInstance.startRequest(filterRequest).then (resp) ->
            _.defaults({
              body: _.map(resp.body, (value) => _.omit(value, '_id', '_rev'))
            }, resp)

          expect(Promise.all([
            expect(promise).to.eventually.property('body').deep.equal([{id: 1, name: 'name2'}]),
            expect(promise).to.eventually.property('request').deep.equal(filterRequest),
          ])).to.eventually.notify(done)
