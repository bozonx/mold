mold = require('../../src/index').default

describe.only 'Functional. Document node.', ->
  beforeEach () ->
    testSchema = () ->
      document: {
        type: 'document'
        schema: {
          boolParam: {type: 'boolean'}
          stringParam: {type: 'string'}
          numberParam: {type: 'number'}
          arrayParam: {
            type: 'array'
            itemsType: 'number'
          }
          nested: {
            type: 'assoc'
            items: {
              nestedStringParam: {type: 'string'}
            }
          }
#          collection: {
#            type: 'collection'
#            item: {
#              id: { type: 'number', key: true }
#              itemStringParam: {type: 'string'}
#            }
#          }
        }
      }

    @testValues = {
      boolParam: true,
      stringParam: 'newValue',
      numberParam: 5,
#      arrayParam: ['value1'],
#      nested:
#        nestedStringParam: 'nestedValue'
    }

    @testSchema = testSchema()
    @moldPath = 'document'
    @mold = mold( {silent: true}, @testSchema )
    @document = @mold.get(@moldPath)
    @document.$init(@moldPath, @testSchema.document)

  it 'load()', ->
    _.set(@mold.$$driverManager.$defaultMemoryDb, 'document', @testValues)

    assert.isFalse(@document.loading)

    promise = @document.load()

    assert.isTrue(@document.loading)

    promise
      .then (response) =>
        assert.deepEqual(response.body, @testValues)
        assert.deepEqual(@document.mold, @testValues)
        assert.isFalse(@document.loading)

  it 'put()', ->
    _.set(@mold.$$driverManager.$defaultMemoryDb, 'document', @testValues)

    assert.isFalse(@document.saving)

    newData = {
      boolParam: false,
      stringParam: 'overlay',
      numberParam: 7,
    }
    promise = @document.put(newData)

    assert.isTrue(@document.saving)

    promise
      .then (response) =>
        assert.isFalse(@document.saving)
        assert.deepEqual(response.body, newData)
        assert.deepEqual(@document.actions.put.mold, newData)

  it 'patch()', ->
    _.set(@mold.$$driverManager.$defaultMemoryDb, 'document', @testValues)

    assert.isFalse(@document.saving)

    newData = {
      stringParam: 'overlay',
    }
    resultData = {
      boolParam: true,
      stringParam: 'overlay',
      numberParam: 5,
    }
    promise = @document.patch(newData)

    assert.isTrue(@document.saving)

    promise
      .then (response) =>
        assert.isFalse(@document.saving)
        assert.deepEqual(response.body, resultData)
        assert.deepEqual(@document.actions.patch.mold, resultData)

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



# TODO: test delete
# TODO: test custom action

#  it "clear()", ->
#    this.document.update({
#      stringParam: 'newValue',
#      numberParam: 5,
#    })
#    this.document.clear();
#    assert.deepEqual(this.document.mold, {})
#
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
#    _.set(moldMain.$$driverManager.$defaultMemoryDb, 'documentsCollection', [testDoc])
#    _.set(moldMain.$$state._storage._storage, 'documentsCollection.action.load[0]', [testDoc])
#    _.extend(_.get(moldMain.$$state._storage._storage, 'documentsCollection.documents.0'), testDoc)
#
#    assert.deepEqual(moldMain.$$driverManager.$defaultMemoryDb.documentsCollection, [testDoc])
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
#        expect(Promise.resolve(moldMain.$$driverManager.$defaultMemoryDb.documentsCollection)).to.eventually.deep.equal([])
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
