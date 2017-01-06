mold = require('../../src/index').default

describe 'Integration.', ->
  describe 'documentsCollection => nested document.', ->
    beforeEach () ->
      testSchema = () ->
        container:
          type: 'container'
          schema:
            documentsCollection:
              type: 'documentsCollection'
              item:
                type: 'collection'
                item:
                  type: 'document'
                  schema:
                    id: {type: 'number', primary: true}

      this.testSchema = testSchema()
      this.mold = mold( {silent: true}, this.testSchema )
      this.doc = {id: 0}
      _.set(this.mold.$$schemaManager.$defaultMemoryDb, 'container.documentsCollection', [
        [this.doc]
      ])

    it "child( 'container.documentsCollection[0][0]' )", ->
      moldPath = 'container.documentsCollection[0][0]'
      document = this.mold.child(moldPath)

      assert.deepEqual(document.schema, this.testSchema.container.schema.documentsCollection.item.item)
      #assert.deepEqual(document.mold, this.doc)
      #assert.equal(document._storagePath)
      assert.equal(document.root, moldPath)
