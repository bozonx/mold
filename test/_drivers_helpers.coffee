_ = require('lodash')
helpers = require('../src/helpers')

module.exports =

  get_primitive_check_mold: (mold, pathToDoc, done) ->
    docContainer = mold.instance(pathToDoc)
    driverInstance = mold.schemaManager.getDriver(pathToDoc)

    # TODO: test another primitives

    splits = helpers.splitLastParamPath(pathToDoc)

    value = 'new value'
    driverRequest = {
      method: 'set'
      moldPath: pathToDoc
      payload: {stringParam: value}
      document: { pathToDocument: pathToDoc }
      driverPath:
        document: pathToDoc
        full: pathToDoc
        base: splits.basePath
        sub: splits.paramPath
    }
    expect(driverInstance.startRequest(driverRequest)).to.eventually.notify =>
      expect(docContainer.get('stringParam')).to.eventually.notify =>
        expect(Promise.resolve(docContainer.mold)).to.eventually.property('stringParam').equal(value).notify(done)

  get_primitive_check_responce: (mold, pathToDoc, done) ->
    docContainer = mold.instance(pathToDoc)
    driverInstance = mold.schemaManager.getDriver(pathToDoc)

    # TODO: test another primitives

    value = 'new value'
    driverSetRequest = {
      method: 'set'
      moldPath: pathToDoc
      driverPath:
        document: pathToDoc
        full: pathToDoc
      payload: {stringParam: value}
      document: { pathToDocument: pathToDoc }
    }

    response = {
      coocked: value
      request:
        method: 'get'
        moldPath: pathToDoc
        schemaBaseType: 'container'
        driverPath:
          full: pathToDoc
      driverResponse:
        stringParam: value
    }

    if (docContainer.isDocument())
      _.assignIn response.request, {
        document: { pathToDocument: pathToDoc }
      }
      response.request.driverPath.document = pathToDoc

    expect(driverInstance.startRequest(driverSetRequest)).to.eventually.notify =>
      promise = docContainer.get('stringParam')
      expect(Promise.all([
        expect(promise).to.eventually.have.property('coocked', response.coocked),
        expect(promise).to.eventually.property('request').deep.equal(response.request),
        expect(promise).to.eventually.property('driverResponse').have.property('stringParam', response.driverResponse.stringParam),
      ])).to.eventually.notify(done)


  set_primitive_check_mold: (mold, pathToDoc, done) ->
    docContainer = mold.instance(pathToDoc)

    # TODO: test another primitives

    expect(docContainer.set('stringParam', 'new value')).to.eventually.notify =>
      expect(Promise.resolve(docContainer.mold)).to.eventually.property('stringParam').equal('new value').notify(done)

  set_primitive_check_response: (mold, pathToDoc, done) ->
    docContainer = mold.instance(pathToDoc)

    # TODO: test another primitives

    value = 'new value'

    # don't check driverResponse because it can be any for each type of driver

    splits = helpers.splitLastParamPath(pathToDoc)

    response = {
      coocked: value
      request:
        method: 'set'
        moldPath: pathToDoc
        driverPath:
          full: pathToDoc
          base: splits.basePath
          sub: splits.paramPath
        payload: {stringParam: value}
    }

    if (docContainer.isDocument())
      _.assignIn response.request, {
        document: { pathToDocument: pathToDoc }
      }
      response.request.driverPath.document = pathToDoc

    promise = docContainer.set('stringParam', value)
    expect(Promise.all([
      expect(promise).to.eventually.have.property('coocked', response.coocked),
      expect(promise).to.eventually.property('request').deep.equal(response.request),
    ])).to.eventually.notify(done)


  get_array: (mold, pathToDoc, done) ->
    docContainer = mold.instance(pathToDoc)
    driverInstance = mold.schemaManager.getDriver(pathToDoc)

    splits = helpers.splitLastParamPath(pathToDoc)

    value = [1,2,3]
    driverRequest = {
      method: 'set'
      moldPath: pathToDoc
      driverPath:
        document: pathToDoc
        full: pathToDoc
        base: splits.basePath
        sub: splits.paramPath
      payload: {arrayParam: value}
      document: { pathToDocument: pathToDoc }
    }
    expect(driverInstance.startRequest(driverRequest)).to.eventually.notify =>
      expect(docContainer.get('arrayParam')).to.eventually.notify =>
        expect(Promise.resolve(docContainer.mold)).to.eventually.property('arrayParam').deep.equal(value).notify(done)


  set_array: (mold, pathToDoc, done) ->
    docContainer = mold.instance(pathToDoc)

    value = [1,2,3]
    expect(docContainer.set('arrayParam', value)).to.eventually.notify =>
      expect(Promise.resolve(docContainer.mold)).to.eventually.property('arrayParam').deep.equal(value).notify(done)

  collection_add: (mold, pathToDoc, done) ->
    driverInstance = mold.schemaManager.getDriver(pathToDoc)

    splits = helpers.splitLastParamPath(pathToDoc)

    driverRequest = {
      moldPath: pathToDoc
      driverPath:
        document: pathToDoc
        full: pathToDoc
        base: splits.basePath
        sub: splits.paramPath
      document: { pathToDocument: pathToDoc }
      primaryKeyName: 'id'
      method: 'add'
      payload: {name: 'name1'}
    }

    driverInstance.startRequest(driverRequest).then((resp) ->
      assert.deepEqual(_.omit(resp.coocked, '_id', '_rev'), {id: 0, name: 'name1'})
      done()
    , (err) ->
      assert.equal(1, err)
      done()
    )

  collection_remove: (mold, pathToDoc, done) ->
    driverInstance = mold.schemaManager.getDriver(pathToDoc)

    splits = helpers.splitLastParamPath(pathToDoc)

    requestBase = {
      moldPath: pathToDoc
      driverPath:
        document: pathToDoc
        full: pathToDoc
        base: splits.basePath
        sub: splits.paramPath
      document: { pathToDocument: pathToDoc }
      primaryKeyName: 'id'
    }

    # add one
    driverRequest = _.defaults({
      method: 'add'
      payload: {name: 'name1'}
    }, requestBase)
    expect(driverInstance.startRequest(driverRequest)).to.eventually.notify =>
      # add two
      driverRequest = _.defaults({
        method: 'add'
        payload: {name: 'name2'}
      }, requestBase)
      expect(driverInstance.startRequest(driverRequest)).to.eventually.notify =>
        # remove first
        driverRequest = _.defaults({
          method: 'remove'
          payload: {id: 0}
        }, requestBase)
        expect(driverInstance.startRequest(driverRequest)).to.eventually.notify =>
          # get all
          driverRequest = _.defaults({
            method: 'filter'
          }, requestBase)
          driverInstance.startRequest(driverRequest).then((resp) =>
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
