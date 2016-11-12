mold = require('../../src/index').default

describe 'Integration.', ->
  describe 'documentsCollection => nested document.', ->
    beforeEach () ->
      testSchema = () ->
        documentsCollection:
          type: 'documentsCollection'
          item:
            type: 'document'
            schema:
              id: {type: 'number', primary: true}

      # TODO: use pounch

      this.testSchema = testSchema()
      this.mold = mold( {}, this.testSchema )
      _.set(this.mold.$$schemaManager.$defaultMemoryDb, 'documentsCollection', [
        {id: 0}
      ])
      this.document = this.mold.child('documentsCollection[0]')

    it 'document instance', ->
      assert.equal(this.document.root, 'documentsCollection[0]')
      # TODO: test it!!!
      #assert.equal(this.document.mold, {})

    it 'load - check responce', (done) ->
      promise = this.document.load()

      expect(Promise.all([
        expect(promise).to.eventually.property('body').deep.equal({id: 0}),
        expect(promise).to.eventually.property('request').deep.equal({
          method: 'get',
          nodeType: 'container',
          storagePath: 'documentsCollection[0]',
          # TODO: is it correct? - without slash
          url: 'documentsCollection/0',
        }),
      ])).to.eventually.notify(done)

    it 'load - check mold of document', (done) ->
      expect(this.document.load()).to.eventually.notify =>
        expect(Promise.resolve(this.document.mold)).to.eventually
        .deep.equal({id: 0})
        .notify(done)

    it 'load - check storage', (done) ->
      expect(this.document.load()).to.eventually.notify =>
        expect(Promise.resolve(this.document._main.$getWholeStorageState())).to.eventually
        .deep.equal({
          __responses:
            'documentsCollection[0]': {id: 0}
          documentsCollection: []
        })
        .notify(done)

#      expect(this.document.load()).to.eventually.notify =>
#        expect(Promise.resolve(this.document.mold)).to.eventually
#        .property('body')
#        .deep.equal(this.testValues)

#      expect(this.document.load()).to.eventually.notify =>
#        expect(Promise.resolve(this.document.mold)).to.eventually
#        .deep.equal(this.testValues)
#        .notify(done)




#  describe 'complex collection', ->
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
