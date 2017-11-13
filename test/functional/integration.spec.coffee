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

      # TODO: use pouch

      this.testSchema = testSchema()
      this.mold = mold( {silent: true}, this.testSchema )
      _.set(this.mold.$$schemaManager.$defaultMemoryDb, 'documentsCollection', [
        {id: 0}
      ])
      this.document = this.mold.child('documentsCollection[0]')

    it 'document empty instance', ->
      assert.equal(this.document.root, 'documentsCollection[0]')
      assert.equal(this.document._schemaPath, 'documentsCollection.item')
      assert.equal(this.document._storagePath, 'documentsCollection.documents[0]')
      assert.deepEqual(this.document.mold, {})

    it 'load - check responce', (done) ->
      promise = this.document.load()

      expect(Promise.all([
        expect(promise).to.eventually.property('body').deep.equal({id: 0}),
        expect(promise).to.eventually.property('request').deep.equal({
          method: 'get',
          moldPath: 'documentsCollection[0]',
          url: 'documentsCollection/0',
        }),
      ])).to.eventually.notify(done)

    it 'load - check mold of document', (done) ->
      expect(this.document.load()).to.eventually.notify =>
        expect(Promise.resolve(this.document.mold)).to.eventually
        .deep.equal({
          $loading: false
          id: 0
        })
        .notify(done)

    it 'load - check storage', (done) ->
      expect(this.document.load()).to.eventually.notify =>
        expect(Promise.resolve(this.document._main.$getWholeStorageState())).to.eventually
        .deep.equal({
          documentsCollection: {
            action:
              load: [],
            state: {loading: []},
            documents: {
              '0': {
                $loading: false
                id: 0
              }
            }
          }
        })
        .notify(done)

  describe 'set schema to specific mount point', ->
    beforeEach () ->
      testSchemaRoot = () ->
        container:
          type: 'container'
          schema:
            paramOfRootContainer: {type: 'string'}

      testSchemaChild = () ->
        type: 'container'
        schema:
          paramOfChildContainer: {type: 'string'}

      @testSchemaRoot = testSchemaRoot()
      @testSchemaChild = testSchemaChild()
      @mold = mold( {silent: true}, @testSchemaRoot )

    it 'set schema', ->
      @mold.setSchema('container.childContainer', @testSchemaChild)
      expect(@mold.$$schemaManager.getFullSchema()).to.be.equal {
        container:  {
          type: 'container'
          schema: {
            paramOfRootContainer: {type: 'string'}
            childContainer: {
              type: 'container'
              schema: {
                paramOfChildContainer: {type: 'string'}
              }
            }
          }
        }
      }



########################################
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
