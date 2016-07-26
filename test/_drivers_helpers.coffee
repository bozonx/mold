_ = require('lodash')
helpers = require('../src/helpers')

generateRequest = (pathToDoc, method, toExtend) ->
  _.defaultsDeep(toExtend, {
    moldPath: pathToDoc
    driverPath:
      document: pathToDoc
      full: pathToDoc
    document: { pathToDocument: pathToDoc }
    method: method
    primaryKeyName: 'id'
  })

module.exports =
  container_get: (mold, pathToDoc, done) ->
    driverInstance = mold.schemaManager.getDriver(pathToDoc)

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
          coocked: _.omit(resp.coocked, '_id', '_rev')
        }, resp)

      expect(Promise.all([
        expect(promise).to.eventually.property('coocked').deep.equal(setRequest.payload),
        expect(promise).to.eventually.property('request').deep.equal(getRequest),
      ])).to.eventually.notify(done)

  container_set: (mold, pathToDoc, done) ->
    driverInstance = mold.schemaManager.getDriver(pathToDoc)

    setRequest = generateRequest(pathToDoc, 'set', {
      payload:
        booleanParam: true
        stringParam: 'new value'
        numberParam: 5
        arrayParam: ['value1']
    })

    promise = driverInstance.startRequest(setRequest).then (resp) ->
      _.defaults({
        coocked: _.omit(resp.coocked, '_id', '_rev')
      }, resp)

    expect(Promise.all([
      expect(promise).to.eventually.property('coocked').deep.equal(setRequest.payload),
      expect(promise).to.eventually.property('request').deep.equal(setRequest),
    ])).to.eventually.notify(done)

  # TODO: filter

  collection_add: (mold, pathToDoc, done) ->
    driverInstance = mold.schemaManager.getDriver(pathToDoc)

    addRequest = generateRequest(pathToDoc, 'add', {
      payload:
        name: 'name1'
    })

    driverInstance.startRequest(addRequest).then((resp) ->
      assert.deepEqual(_.omit(resp.coocked, '_id', '_rev'), {id: 0, name: 'name1'})
      done()
    , (err) ->
      assert.equal(1, err)
      done()
    )

  collection_remove: (mold, pathToDoc, done) ->
    driverInstance = mold.schemaManager.getDriver(pathToDoc)

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
          driverInstance.startRequest(filterRequest).then((resp) =>
            clearValue = _.map(resp.coocked, (value) => _.omit(value, '_id', '_rev'))
            assert.deepEqual(clearValue, [{id: 1, name: 'name2'}])
            done()
          , (err) =>
            assert.equal(1, err)
            done()
          )

  collection_get_item_and_get_primitive: (mold, pathToDoc, done) ->
    driverInstance = mold.schemaManager.getDriver(pathToDoc)
    collection = mold.instance(pathToDoc)

    #splits = helpers.splitLastParamPath(pathToDoc)
    #    splits = helpers.splitLastParamPath(pathToDoc)


    requestBase = {
      moldPath: pathToDoc
      driverPath:
        document: pathToDoc
        full: pathToDoc
#        base: splits.basePath
#        sub: splits.paramPath
      document: { pathToDocument: pathToDoc }
      primaryKeyName: 'id'
    }

    # add one
    driverRequest = _.defaults({
      method: 'add'
      payload: {id: 2, name: 'name1'}
    }, requestBase)
    expect(driverInstance.startRequest(driverRequest)).to.eventually.notify =>
      collectionItem = collection.child(2)

      expect(collectionItem.get()).to.eventually.notify =>
        expect(Promise.resolve(collectionItem.mold)).to.eventually
        .deep.equal({})
        .notify(done)

#      expect(collectionItem.get()).to.eventually.notify =>
#        primitiveOfName = collectionItem.child('name')
#        expect(Promise.resolve(primitiveOfName.mold)).to.eventually
#        .equal('name1')
#        .notify(done)
