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
    this.mold = mold( {}, this.testSchema() )
    this.documentsCollection = this.mold.instance('documentsCollection')

  # init, child and getFlat aren't testing. It's testing in paged_collection spec

  it "addDocument", ->
    # TODO: do it!

  describe "load", ->
    it 'load() - check promise', ->
      page = [{id: 0}]
      _.set(this.mold.$$schemaManager.$defaultMemoryDb, 'documentsCollection[0]', page)
      promise = this.documentsCollection.load(0)
      expect(promise).to.eventually
        .property('coocked').deep.equal(page)

    it 'load() - check mold', (done) ->
      page = [{id: 0}]
      _.set(this.mold.$$schemaManager.$defaultMemoryDb, 'documentsCollection[0]', page)
      expect(this.documentsCollection.load(0)).to.eventually.notify =>
        expect(Promise.resolve(this.documentsCollection.mold)).to.eventually
        .deep.equal([[{ id: 0, $index: 0 }]])
        .notify(done)

  describe "save", ->
    # TODO: do it!


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
#    it 'save() added - check promise', ->
#      _.set(this.mold.schemaManager.$defaultMemoryDb, 'inMemory.collectionParam', [testValues[0]])
#
#      this.collectionParam.unshift({name: 'name3'})
#
#      expect(this.collectionParam.save()).to.eventually
#      .property(0).property('resp').property('coocked').deep.equal({id: 1, name: 'name3'})
#
#    it 'save() added - check memory', (done) ->
#      _.set(this.mold.schemaManager.$defaultMemoryDb, 'inMemory.collectionParam', [testValues[0]])
#      this.collectionParam.unshift({name: 'name3'})
#
#      expect(this.collectionParam.save()).to.eventually.notify =>
#        expect(Promise.resolve(this.mold.schemaManager.$defaultMemoryDb)).to.eventually
#        .deep.equal({inMemory: {collectionParam: [
#          testValues[0],
#          {name: 'name3', id: 1}
#        ]}})
#        .notify(done)
#
#    it 'save() added - check unsaved', (done) ->
#      _.set(this.mold.schemaManager.$defaultMemoryDb, 'inMemory.collectionParam', [testValues[0]])
#      this.collectionParam.unshift({name: 'name3'})
#
#      expect(this.collectionParam.save()).to.eventually.notify =>
#        expect(Promise.resolve(this.mold.schemaManager.$defaultMemoryDb)).to.eventually.notify =>
#          expect(Promise.resolve(this.collectionParam._main.state._request._addedUnsavedItems)).to.eventually
#          .deep.equal({})
#          .notify(done)
#
#    it 'save() removed - check memory', (done) ->
#      _.set(this.mold.schemaManager.$defaultMemoryDb, 'inMemory.collectionParam', [testValues[0], testValues[1]])
#      expect(this.collectionParam.load()).to.eventually.notify =>
#        this.collectionParam.removeMold(this.collectionParam.mold[0])
#
#        expect(this.collectionParam.save()).to.eventually.notify =>
#          expect(Promise.resolve(this.mold.schemaManager.$defaultMemoryDb)).to.eventually
#          .deep.equal({inMemory: {collectionParam: [testValues[1]]}})
#          .notify(done)
#
#    it 'save() removed - check unsaved', (done) ->
#      _.set(this.mold.schemaManager.$defaultMemoryDb, 'inMemory.collectionParam', testValues)
#      expect(this.collectionParam.load()).to.eventually.notify =>
#        this.collectionParam.removeMold(this.collectionParam.mold[0])
#
#        expect(this.collectionParam.save()).to.eventually.notify =>
#          expect(Promise.resolve(this.collectionParam._main.state._request._removedUnsavedItems)).to.eventually
#          .deep.equal({})
#          .notify(done)
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
