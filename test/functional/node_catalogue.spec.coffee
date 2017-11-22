mold = require('../../src/index').default

describe.only 'Functional. Catalogue node.', ->
  beforeEach () ->
    testSchema = () ->
      catalogue: {
        type: 'catalogue'
        item: {
          $id: {type: 'number', primary: true}
          name: {type: 'string'}
        }
      }

    @testValues = [
      { $id: 1, name: 'value1' }
      { $id: 2, name: 'value2' }
    ]
    @testSchema = testSchema()
    @moldPath = 'catalogue'
    @mold = mold( {silent: true}, @testSchema )
    @catalogue = @mold.get(@moldPath)
    @catalogue.$init(@moldPath, @testSchema.catalogue)

  it 'load', ->
    _.set(@mold.$$driverManager.$defaultMemoryDb, 'catalogue', @testValues)

    assert.isFalse(@catalogue.loading)

    promise = @catalogue.load()

    assert.isTrue(@catalogue.loading)

    promise
      .then (response) =>
        assert.deepEqual(response.body, @testValues)
        assert.deepEqual(@catalogue.mold, @testValues)
        assert.isFalse(@catalogue.loading)

  it 'load page', ->

  it 'create and remove', ->


#  it "without document", ->
#    schema = documentsCollection:
#      type: 'documentsCollection'
#
#    moldInstance = mold( {silent: true}, schema )
#    documentsCollection = moldInstance.child('documentsCollection')
#
#    items = [{$id: 0}]
#    _.set(moldInstance.$$driverManager.$defaultMemoryDb, 'documentsCollection', items)
#
#    expect(documentsCollection.load(0)).to.eventually.notify =>
#      expect(Promise.resolve(documentsCollection.mold)).to.eventually
#      .deep.equal([[{ $id: 0, $index: 0, $pageIndex: 0 }]])
#      .notify(done)
#
#  it "clear()", ->
#    _.set(this.mold.$$state._storage._storage, 'documentsCollection', {
#      action:
#        load: [{$id: 0}],
#      state: {loading: [0]},
#      documents: {'0': {$id: 0}}
#    })
#    this.documentsCollection.clear();
#    assert.deepEqual(this.mold.$$state._storage._storage.documentsCollection, {
#      action:
#        load: [],
#      state: {loading: [0]},
#      documents: {'0': {$id: 0}}
#    })
#
#
#  describe "load", ->
#    beforeEach () ->
#      this.items = [{$id: 0}]
#      _.set(this.mold.$$driverManager.$defaultMemoryDb, 'documentsCollection', this.items)
#
#    it 'load(page) - check promise', ->
#      promise = this.documentsCollection.load(0)
#      expect(promise).to.eventually
#        .property('body').deep.equal(this.items)
#
#    it 'load(page) - check mold', (done) ->
#      expect(this.documentsCollection.load(0)).to.eventually.notify =>
#        expect(Promise.resolve(this.documentsCollection.mold)).to.eventually
#        .deep.equal([[{ $id: 0, $index: 0, $pageIndex: 0 }]])
#        .notify(done)
#
#    it 'load(1) - load second page', (done) ->
#      this.items = [{$id: 0}, {$id: 1}, {$id: 2}, {$id: 3}, {$id: 4}]
#      _.set(this.mold.$$driverManager.$defaultMemoryDb, 'documentsCollection', this.items)
#
#      this.documentsCollection.perPage = 2
#
#      expect(this.documentsCollection.load(1)).to.eventually.notify =>
#        expect(Promise.resolve(this.documentsCollection.mold)).to.eventually
#        .property(1).deep.equal([
#          { $id: 2, $index: 0, $pageIndex: 1 },
#          { $id: 3, $index: 1, $pageIndex: 1 },
#        ])
#        .notify(done)
#
#    it "loading state", (done) ->
#      handler = sinon.spy();
#      this.mold.onChange(handler)
#
#      assert.deepEqual(this.documentsCollection.loading, [])
#      promise = this.documentsCollection.load(0)
#      assert.deepEqual(this.documentsCollection.loading, [0])
#
#      expect(handler).to.have.been.calledWith({
#        storagePath: 'documentsCollection'
#        action: 'change'
#      })
#
#      expect(promise).to.eventually.notify =>
#        expect(Promise.all([
#          expect(handler).to.have.been.calledTwice,
#          expect(Promise.resolve(this.documentsCollection.loading)).to.eventually.deep.equal([]),
#        ])).to.eventually.notify(done)
#
#
#  describe "create()", ->
#    beforeEach () ->
#      this.newDoc = {name: 'a'}
#
#    it "check response", ->
#      promise = this.documentsCollection.create(this.newDoc)
#      expect(promise).to.eventually.property('body').deep.equal({
#        $id: 0,
#        name: 'a'
#      })
#
#    it "check mold", (done) ->
#      this.documentsCollection.unshift(this.newDoc)
#      promise = this.documentsCollection.create(this.newDoc)
#
#      assert.isTrue(this.newDoc.$addedUnsaved)
#      assert.isTrue(this.newDoc.$saving)
#      expect(promise).to.eventually.notify =>
#        assert.isUndefined(this.newDoc.$addedUnsaved)
#        assert.isUndefined(this.newDoc.$adding)
#        expect(Promise.resolve(this.documentsCollection.mold)).to.eventually
#        .deep.equal([[
#          {
#            $pageIndex: 0,
#            $saving: false,
#            $index: 0,
#            name: 'a',
#            $id: 0,
#          }
#        ]])
#        .notify(done)
#
#  describe "remove", ->
#    beforeEach () ->
#      this.doc = {$id: 0, name: 'a', $index: 0}
#
#    it "check response", (done) ->
#      expect(this.documentsCollection.create(this.doc)).to.eventually.notify =>
#        promise = this.documentsCollection.remove(this.doc)
#        expect(promise).to.eventually.property('body').equal(undefined)
#        .notify(done)
#
#    it "check mold", (done) ->
#      this.documentsCollection.unshift(this.doc)
#      expect(this.documentsCollection.create(this.doc)).to.eventually.notify =>
#        promise = this.documentsCollection.remove(this.doc)
#
#        assert.isTrue(this.doc.$deleting)
#        expect(promise).to.eventually.notify =>
#          assert.isFalse(this.doc.$deleting)
#          expect(Promise.resolve(this.documentsCollection.mold)).to.eventually
#            .deep.equal([[]])
#            .notify(done)
