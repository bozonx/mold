module.exports =

  # TODO: test coocked responce param

  get_primitive_check_responce: (mold, pathToDoc, done) ->
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
      expect(docContainer.get('stringParam')).to.eventually
      .property('coocked').equal(value).notify(done)

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


  set_primitive: (mold, pathToDoc, done) ->
    docContainer = mold.instance(pathToDoc)

    # TODO: test another primitives

    expect(docContainer.set('stringParam', 'new value')).to.eventually.notify =>
      expect(Promise.resolve(docContainer.mold)).to.eventually.property('stringParam').equal('new value').notify(done)

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
