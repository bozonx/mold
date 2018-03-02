index = require('../../src/index')
Document = require('../../src/nodes/Document')

# TODO: test delete
# TODO: test custom action

describe 'Functional. Document node.', ->
  beforeEach () ->
    testSchema = () ->
      document: {
        type: 'document'
        schema: {
          boolParam: {type: 'boolean'}
          stringParam: {type: 'string'}
          numberParam: {type: 'number'}
        }
      }

    @testValues = {
      boolParam: true,
      stringParam: 'newValue',
      numberParam: 5,
    }

    @testSchema = testSchema()
    @moldPath = 'document'
    @mold = index( @testSchema, {silent: true} )
    @document = @mold.get(@moldPath)
    @document.$init(@moldPath, @testSchema.document)

  it "validate schema - node without schema", ->
    testSchema = {
      document: {
        type: 'document'
      }
    }

    assert.equal(
      Document.validateSchema(testSchema.document, 'document'),
      'The definition of "document" node on "document" must has a "schema"!'
    )

  it "validate schema - schema with 'type' param", ->
    testSchema = {
      document: {
        type: 'document'
        schema: {
          type: 'string'
        }
      }
    }

    assert.equal(
      Document.validateSchema(testSchema.document, 'document'),
      'Schema definition of "document" node on "document" must not to have a "type" param! It has to be just plain object.'
    )

  it 'load()', ->
    _.set(@mold.$main.driverManager.$defaultMemoryDb, 'document', @testValues)

    assert.isFalse(@document.loading)

    promise = @document.load()

    assert.isTrue(@document.loading)

    promise
      .then (response) =>
        assert.deepEqual(response.body, @testValues)
        assert.deepEqual(@document.mold, @testValues)
        assert.isFalse(@document.loading)

  it 'put()', ->
    _.set(@mold.$main.driverManager.$defaultMemoryDb, 'document', @testValues)

    assert.isFalse(@document.saving)

    newData = {
      boolParam: false,
      stringParam: 'overlay',
    }
    promise = @document.put(newData)

    assert.deepEqual(@document.actions.put.mold, newData)
    assert.deepEqual(@document.mold, newData)
    assert.isTrue(@document.saving)

    promise
      .then (response) =>
        assert.isFalse(@document.saving)
        assert.deepEqual(response.body, newData)

        assert.deepEqual(@document.actions.put.mold, newData)
        assert.deepEqual(@document._main.storage.getState(@document._moldPath, 'put'), {})
        assert.deepEqual(@document._main.storage.getSolid(@document._moldPath, 'put'), newData)

        assert.deepEqual(@document.mold, newData)
        assert.deepEqual(@document._main.storage.getState(@document._moldPath, 'default'), {})
        assert.deepEqual(@document._main.storage.getSolid(@document._moldPath, 'default'), newData)

  it 'patch()', ->
    _.set(@mold.$main.driverManager.$defaultMemoryDb, 'document', @testValues)

    assert.isFalse(@document.saving)

    newData = {
      stringParam: 'overlay'
    }
    updatedData = {
      boolParam: undefined
      stringParam: 'overlay'
      numberParam: undefined
    }
    resultData = {
      boolParam: true
      stringParam: 'overlay'
      numberParam: 5
    }

    promise = @document.patch(newData)

    assert.deepEqual(@document.actions.patch.mold, updatedData)
    assert.deepEqual(@document.mold, updatedData)
    assert.isTrue(@document.saving)

    promise
      .then (response) =>
        assert.isFalse(@document.saving)
        assert.deepEqual(response.body, resultData)

        assert.deepEqual(@document.actions.patch.mold, resultData)
        assert.deepEqual(@document._main.storage.getState(@document._moldPath, 'patch'), {})
        assert.deepEqual(@document._main.storage.getSolid(@document._moldPath, 'patch'), resultData)

        assert.deepEqual(@document.mold, resultData)
        assert.deepEqual(@document._main.storage.getState(@document._moldPath, 'default'), {})
        assert.deepEqual(@document._main.storage.getSolid(@document._moldPath, 'default'), resultData)

  it 'custom action', ->
    @testSchema.document.actions = {
      custom: (Action) ->
        class extends Action
          init: ->
            this.setDriverParams({
              method: 'get',
            });
    }
    @document = @mold.get(@moldPath)
    @document.$init(@moldPath, @testSchema.document)

    assert.isFalse(@document.actions.custom.pending)

    #promise = this.document.actions.custom.request()
    # TODO: make request with custom driver params and check driver request

#  it "remove", (done) ->
#    testSchema = () ->
#      documentsCollection:
#        type: 'documentsCollection'
#        item:
#          type: 'document'
#          schema:
#            $id: {type: 'number', primary: true}
#
#    testDoc = {
#      $id: 0,
#      $pageIndex: 0,
#      $index: 0,
#    }
#
#    moldMain = mold( {silent: true}, testSchema() )
#    document = moldMain.child('documentsCollection[0]')
#
#    _.set(moldMain.driverManager.$defaultMemoryDb, 'documentsCollection', [testDoc])
#    _.set(moldMain.$$state._storage._storage, 'documentsCollection.action.load[0]', [testDoc])
#    _.extend(_.get(moldMain.$$state._storage._storage, 'documentsCollection.documents.0'), testDoc)
#
#    assert.deepEqual(moldMain.driverManager.$defaultMemoryDb.documentsCollection, [testDoc])
#    assert.deepEqual(moldMain.$$state._storage._storage.documentsCollection.action.load, [[testDoc]])
#    assert.deepEqual(document.mold, testDoc)
#
#    promise = document.remove()
#
#    assert.isTrue(document.mold.$deleting)
#
#    expect(promise).to.eventually.notify =>
#      expect(Promise.all([
#        expect(Promise.resolve(document.mold.$deleting)).to.eventually.equal(false)
#        expect(Promise.resolve(document.mold.$deleted)).to.eventually.equal(true)
#        expect(Promise.resolve(moldMain.$$state._storage._storage.documentsCollection.action.load)).to.eventually.deep.equal([[]])
#        # don't delete form documents
#        expect(Promise.resolve(moldMain.$$state._storage._storage.documentsCollection.documents['0'].$id)).to.eventually.equal(0)
#        expect(Promise.resolve(moldMain.driverManager.$defaultMemoryDb.documentsCollection)).to.eventually.deep.equal([])
#      ])).to.eventually.notify(done)
#
#  it "try to save unsaveable", ->
#    testSchema = () ->
#      document:
#        type: 'document'
#        schema:
#          $id: {type: 'number'}
#          unsaveable: {type: 'string', saveable: false}
#
#    moldMain = mold( {silent: true}, testSchema() )
#    document = moldMain.child('document')
#
#    expect(document.put({$id: 0, unsaveable: 'newValue'})).to.eventually
#    .property('request').property('payload').deep.equal({
#      $id: 0,
#    })
#
#  it "update read only - it throws an error", ->
#    testSchema = () ->
#      document:
#        type: 'document'
#        schema:
#          $id: {type: 'number', readOnly: true}
#
#    moldMain = mold( {silent: true}, testSchema() )
#    document = moldMain.child('document')
#
#    assert.throws(document.update.bind(document, {$id: 5}))
