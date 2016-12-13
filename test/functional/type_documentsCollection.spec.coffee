mold = require('../../src/index').default

describe 'Functional. DocumentsCollection type.', ->
  beforeEach () ->
    this.testSchema = () ->
      documentsCollection:
        type: 'documentsCollection'
        item:
          type: 'document'
          schema:
            id: {type: 'number', primary: true}
            name: {type: 'string'}
    this.mold = mold( {silent: true}, this.testSchema() )
    this.documentsCollection = this.mold.child('documentsCollection')

  # init, child and getFlat aren't testing here. It's testing in paged_collection spec

  describe "load", ->
    beforeEach () ->
      this.items = [{id: 0}]
      _.set(this.mold.$$schemaManager.$defaultMemoryDb, 'documentsCollection', this.items)

    it 'load(page) - check promise', ->
      promise = this.documentsCollection.load(0)
      expect(promise).to.eventually
        .property('body').deep.equal(this.items)

    it 'load(page) - check mold', (done) ->
      expect(this.documentsCollection.load(0)).to.eventually.notify =>
        expect(Promise.resolve(this.documentsCollection.mold)).to.eventually
        .property('pages').deep.equal([[{ id: 0, $index: 0, $pageIndex: 0 }]])
        .notify(done)

    it 'load(1) - load second page', (done) ->
      this.items = [{id: 0}, {id: 1}, {id: 2}, {id: 3}, {id: 4}]
      _.set(this.mold.$$schemaManager.$defaultMemoryDb, 'documentsCollection', this.items)

      this.documentsCollection.perPage = 2

      expect(this.documentsCollection.load(1)).to.eventually.notify =>
        expect(Promise.resolve(this.documentsCollection.mold)).to.eventually
        .property('pages').property(1).deep.equal([
          { id: 2, $index: 0, $pageIndex: 1 },
          { id: 3, $index: 1, $pageIndex: 1 },
        ])
        .notify(done)

  describe "create()", ->
    beforeEach () ->
      this.newDoc = {name: 'a'}

    it "check response", ->
      promise = this.documentsCollection.create(this.newDoc)
      expect(promise).to.eventually.property('body').deep.equal({
        id: 0,
        name: 'a'
      })

    it "check mold", (done) ->
      this.documentsCollection.unshift(this.newDoc)
      promise = this.documentsCollection.create(this.newDoc)

      assert.isTrue(this.newDoc.$addedUnsaved)
      assert.isTrue(this.newDoc.$adding)
      expect(promise).to.eventually.notify =>
        assert.isUndefined(this.newDoc.$addedUnsaved)
        assert.isUndefined(this.newDoc.$adding)
        expect(Promise.resolve(this.documentsCollection.mold)).to.eventually
        .property('pages').deep.equal([[
          {
            $pageIndex: 0,
            $index: 0,
            name: 'a',
            id: 0,
          }
        ]])
        .notify(done)

  describe "deleteDocument", ->
    beforeEach () ->
      this.doc = {id: 0, name: 'a', $index: 0}

    it "check response", (done) ->
      expect(this.documentsCollection.create(this.doc)).to.eventually.notify =>
        promise = this.documentsCollection.deleteDocument(this.doc)
        expect(promise).to.eventually.property('body').equal(undefined)
        .notify(done)

    it "check mold", (done) ->
      this.documentsCollection.unshift(this.doc)
      expect(this.documentsCollection.create(this.doc)).to.eventually.notify =>
        promise = this.documentsCollection.deleteDocument(this.doc)

        assert.isTrue(this.doc.$deleting)
        expect(promise).to.eventually.notify =>
          assert.isUndefined(this.doc.$deleting)
          expect(Promise.resolve(this.documentsCollection.mold)).to.eventually
            .property('pages').deep.equal([[]])
            .notify(done)
