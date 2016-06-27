module.exports =

  # TODO: test coocked responce param

  get_primitive: (mold, pathToDoc, done) ->
    docContainer = mold.instance(pathToDoc)
    driverInstance = mold.schemaManager.getDriver(pathToDoc)

    # TODO: use another primitives
    value = 'new value'
    driverRequest = {
      type: 'set'
      fullPath: pathToDoc
      payload: {stringParam: value}
      document: {stringParam: value}
      pathToDocument: pathToDoc
    }
    expect(driverInstance.requestHandler(driverRequest)).to.eventually.notify =>
      expect(docContainer.get('stringParam')).to.eventually.notify =>
        expect(Promise.resolve(docContainer.mold)).to.eventually.property('stringParam').equal(value).notify(done)

  set_primitive: (mold, pathToDoc, done) ->
    docContainer = mold.instance(pathToDoc)

    # TODO: use another primitives
    expect(docContainer.set('stringParam', 'new value')).to.eventually.notify =>
      console.log(docContainer.mold)
      expect(Promise.resolve(docContainer.mold)).to.eventually.property('stringParam').equal('new value').notify(done)

  get_array: (mold, pathToDoc, done) ->
    docContainer = mold.instance(pathToDoc)
    driverInstance = mold.schemaManager.getDriver(pathToDoc)

    value = [1,2,3]
    driverRequest = {
      type: 'set'
      fullPath: pathToDoc
      payload: {arrayParam: value}
      document: {arrayParam: value}
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
