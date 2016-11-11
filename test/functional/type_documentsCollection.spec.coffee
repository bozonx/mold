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
    this.documentsCollection = this.mold.instance('documentsCollection')

  # init, child and getFlat aren't testing. It's testing in paged_collection spec

  describe "load", ->
    beforeEach () ->
      this.page = [{id: 0}]
      _.set(this.mold.$$schemaManager.$defaultMemoryDb, 'documentsCollection', this.page)

    it 'load(page) - check promise', ->
      promise = this.documentsCollection.load(0)
      expect(promise).to.eventually
        .property('body').deep.equal(this.page)

    it 'load(page) - check mold', (done) ->
      expect(this.documentsCollection.load(0)).to.eventually.notify =>
        expect(Promise.resolve(this.documentsCollection.mold)).to.eventually
        .deep.equal([[{ id: 0, $index: 0 }]])
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
              # TODO: раскомментировать, когда будет сделанно обновление элемента в request
              #id: 0,
              name: 'a',
              $index: 0
            }
          ]])
          .notify(done)

  describe "deleteDocument", ->
    beforeEach () ->
      this.doc = {id: 0, name: 'a', $index: 0}

    it "check response", (done) ->
      expect(this.documentsCollection.createDocument(this.doc)).to.eventually.notify =>
        promise = this.documentsCollection.deleteDocument(this.doc)
        expect(promise).to.eventually.property('body').deep.equal({
          id: 0,
          name: 'a'
        })
        .notify(done)

#    it "check mold", (done) ->
#      this.documentsCollection.unshift(this.doc)
#      expect(this.documentsCollection.createDocument(this.doc)).to.eventually.notify =>
#        promise = this.documentsCollection.deleteDocument(this.doc)
#
#        assert.isTrue(this.doc.$deletting)
#        expect(promise).to.eventually.notify =>
#          assert.isUndefined(this.doc.$deletting)
#          expect(Promise.resolve(this.documentsCollection.mold)).to.eventually
#            .deep.equal([[]])
#            .notify(done)

#  describe 'unshift({...}), removeMold({...})', ->
#    beforeEach () ->
#      this.mold = mold( {}, testSchema() )
#      this.collectionParam = this.mold.instance('inMemory.collectionParam')
#
#    it 'unshift() - check mold', ->
#      newItem = {name: 'name3'}
#      this.collectionParam.unshift(newItem)
#      assert.deepEqual(this.collectionParam.mold, [
#        {name: 'name3', $isNew: true, $index: 0},
#      ])
#
#    it 'unshift() - after load', (done) ->
#      _.set(this.mold.schemaManager.$defaultMemoryDb, 'inMemory.collectionParam', [testValues[0]])
#
#      newItem = {name: 'name3'}
#      expect(this.collectionParam.load()).to.eventually.notify =>
#        this.collectionParam.unshift(newItem)
#        expect(Promise.resolve(this.collectionParam.mold)).to.eventually
#        .deep.equal([
#          {name: 'name3', $isNew: true, $index: 0},
#          {id: 0, name: 'name0', $index: 1},
#        ])
#        .notify(done)
#
#    it 'removeMold() - after load', (done) ->
#      _.set(this.mold.schemaManager.$defaultMemoryDb, 'inMemory.collectionParam', testValues)
#
#      expect(this.collectionParam.load()).to.eventually.notify =>
#        this.collectionParam.removeMold({$index: 0})
#        expect(Promise.resolve(this.collectionParam.mold)).to.eventually
#        .deep.equal([
#          {id: 1, name: 'name1', $index: 0},
#        ])
#        .notify(done)
#
#  describe 'save() added, save() removed', ->
#    beforeEach () ->
#      this.mold = mold( {}, testSchema() )
#      this.collectionParam = this.mold.instance('inMemory.collectionParam')
#

#  describe 'complex', ->
#    beforeEach () ->
#      this.mold = mold( {}, testSchema() )
#      this.collectionParam = this.mold.instance('inMemory.collectionParam')
#
#    it 'Many manupulations with collection', (done) ->
#      this.collectionParam.unshift({name: 'name0'})
#      this.collectionParam.unshift({name: 'name1'})
#      this.collectionParam.unshift({name: 'name2'})
#
#      assert.deepEqual _.compact(this.collectionParam.mold), [
#        {
#          name: 'name2'
#          $index: 0
#          $isNew: true
#        }
#        {
#          name: 'name1'
#          $index: 1
#          $isNew: true
#        }
#        {
#          name: 'name0'
#          $index: 2
#          $isNew: true
#        }
#      ]
#
#      this.collectionParam.removeMold(this.collectionParam.mold[1])
#      this.collectionParam.child(1).setMold('name', 'new name')
#      assert.deepEqual _.compact(this.collectionParam.mold), [
#        {
#          name: 'name2'
#          $index: 0
#          $isNew: true
#        }
#        {
#          name: 'new name'
#          $index: 1
#          $isNew: true
#        }
#      ]
#
#      expect(this.collectionParam.save()).to.eventually.notify =>
#        expect(Promise.resolve(this.collectionParam.mold)).to.eventually
#        .deep.equal([
#          {
#            id: 0
#            name: 'name2'
#            $index: 0
#          }
#          {
#            id: 1
#            name: 'new name'
#            $index: 1
#          }
#        ])
#        .notify(done)
#
#      # TODO: проверить - удаленный элемент не должен сохраняться, так как он новосозданный
