_ = require('lodash')

module.exports =

  get_primitive_check_mold: (mold, pathToDoc, done) ->
    docContainer = mold.instance(pathToDoc)
    driverInstance = mold.schemaManager.getDriver(pathToDoc)

    # TODO: test another primitives

    value = 'new value'
    driverRequest = {
      method: 'set'
      fullPath: pathToDoc
      payload: {stringParam: value}
      pathToDocument: pathToDoc
    }
    expect(driverInstance.requestHandler(driverRequest)).to.eventually.notify =>
      expect(docContainer.get('stringParam')).to.eventually.notify =>
        expect(Promise.resolve(docContainer.mold)).to.eventually.property('stringParam').equal(value).notify(done)

  get_primitive_check_responce: (mold, pathToDoc, done) ->
    docContainer = mold.instance(pathToDoc)
    driverInstance = mold.schemaManager.getDriver(pathToDoc)

    # TODO: test another primitives

    value = 'new value'
    driverSetRequest = {
      method: 'set'
      fullPath: pathToDoc
      payload: {stringParam: value}
      pathToDocument: pathToDoc
    }

    response = {
      coocked: value
      request:
        method: 'get'
        fullPath: pathToDoc
      successResponse:
        stringParam: value
    }

    if (docContainer.isDocument())
      _.assignIn response.request, {
        pathToDocument: pathToDoc
        documentParams:
          pathToDocument: pathToDoc
      }

    expect(driverInstance.requestHandler(driverSetRequest)).to.eventually.notify =>
      promise = docContainer.get('stringParam')
      expect(Promise.all([
        expect(promise).to.eventually.have.property('coocked', response.coocked),
        expect(promise).to.eventually.property('request').deep.equal(response.request),
        expect(promise).to.eventually.property('successResponse').have.property('stringParam', response.successResponse.stringParam),
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

    # don't check successResponse because it can be any for each type of driver
    
    response = {
      coocked: value
      request:
        method: 'set'
        fullPath: pathToDoc
        payload: {stringParam: value}
    }

    if (docContainer.isDocument())
      _.assignIn response.request, {
        pathToDocument: pathToDoc
        documentParams:
          pathToDocument: pathToDoc
      }

    promise = docContainer.set('stringParam', value)
    expect(Promise.all([
      expect(promise).to.eventually.have.property('coocked', response.coocked),
      expect(promise).to.eventually.property('request').deep.equal(response.request),
    ])).to.eventually.notify(done)


  get_array: (mold, pathToDoc, done) ->
    docContainer = mold.instance(pathToDoc)
    driverInstance = mold.schemaManager.getDriver(pathToDoc)

    value = [1,2,3]
    driverRequest = {
      method: 'set'
      fullPath: pathToDoc
      payload: {arrayParam: value}
      pathToDocument: pathToDoc
    }
    expect(driverInstance.requestHandler(driverRequest)).to.eventually.notify =>
      expect(docContainer.get('arrayParam')).to.eventually.notify =>
        expect(Promise.resolve(docContainer.mold)).to.eventually.property('arrayParam').deep.equal(value).notify(done)


  set_array: (mold, pathToDoc, done) ->
    docContainer = mold.instance(pathToDoc)

    value = [1,2,3]
    expect(docContainer.set('arrayParam', value)).to.eventually.notify =>
      expect(Promise.resolve(docContainer.mold)).to.eventually.property('arrayParam').deep.equal(value).notify(done)
