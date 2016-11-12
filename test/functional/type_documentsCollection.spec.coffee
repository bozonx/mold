mold = require('../../src/index').default

describe 'Functional. DocumentsCollection type.', ->
  beforeEach () ->
    this.testSchema = () ->
      documentsCollection:
        type: 'documentsCollection'
        item:
          type: 'collection'
          item:
            type: 'document'
            schema:
              id: {type: 'number', primary: true}
              name: {type: 'string'}
    this.mold = mold( {}, this.testSchema() )
    this.documentsCollection = this.mold.child('documentsCollection')

  # init, child and getFlat aren't testing. It's testing in paged_collection spec

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
        .deep.equal([[{ id: 0, $index: 0, $pageIndex: 0 }]])
        .notify(done)

    it 'load(1) - load second page', (done) ->
      this.items = [{id: 0}, {id: 1}, {id: 2}, {id: 3}, {id: 4}]
      _.set(this.mold.$$schemaManager.$defaultMemoryDb, 'documentsCollection', this.items)

      this.documentsCollection.perPage = 2

      expect(this.documentsCollection.load(1)).to.eventually.notify =>
        expect(Promise.resolve(this.documentsCollection.mold)).to.eventually
        .property(1).deep.equal([
          { id: 2, $index: 0, $pageIndex: 1 },
          { id: 3, $index: 1, $pageIndex: 1 },
        ])
        .notify(done)

  describe "createDocument", ->
    beforeEach () ->
      this.newDoc = {name: 'a'}

    it "check response", ->
      this.documentsCollection.unshift(this.newDoc)
      promise = this.documentsCollection.createDocument(this.newDoc)
      expect(promise).to.eventually.property('body').deep.equal({
        id: 0,
        name: 'a'
      })

    it "check mold", (done) ->
      this.documentsCollection.unshift(this.newDoc)
      promise = this.documentsCollection.createDocument(this.newDoc)

      assert.isTrue(this.newDoc.$addedUnsaved)
      assert.isTrue(this.newDoc.$adding)
      expect(promise).to.eventually.notify =>
        assert.isUndefined(this.newDoc.$addedUnsaved)
        assert.isUndefined(this.newDoc.$adding)
        expect(Promise.resolve(this.documentsCollection.mold)).to.eventually
          .deep.equal([[
            {
              $pageIndex: 0,
              $index: 0,
              name: 'a',
              # TODO: раскомментировать, когда будет сделанно обновление элемента в request
              #id: 0,
            }
          ]])
          .notify(done)

  describe "deleteDocument", ->
    beforeEach () ->
      this.doc = {id: 0, name: 'a', $index: 0}

    it "check response", (done) ->
      expect(this.documentsCollection.createDocument(this.doc)).to.eventually.notify =>
        promise = this.documentsCollection.deleteDocument(this.doc)
        expect(promise).to.eventually.property('body').equal(undefined)
        .notify(done)

    it "check mold", (done) ->
      this.documentsCollection.unshift(this.doc)
      expect(this.documentsCollection.createDocument(this.doc)).to.eventually.notify =>
        promise = this.documentsCollection.deleteDocument(this.doc)

        assert.isTrue(this.doc.$deleting)
        expect(promise).to.eventually.notify =>
          assert.isUndefined(this.doc.$deleting)
          expect(Promise.resolve(this.documentsCollection.mold)).to.eventually
            .deep.equal([[]])
            .notify(done)
