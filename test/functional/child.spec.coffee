mold = require('../../src/index').default

describe 'Functional. Child.', ->
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

  it "child( 'container.documentsCollection[0]' )", ->
    moldPath = 'container.documentsCollection[0]'
    document = this.mold.child(moldPath)

    assert.deepEqual(document.schema, this.testSchema.container.schema.documentsCollection.item.item)
    assert.equal(document._schemaPath, 'container.schema.documentsCollection.item.item')
    assert.equal(document.root, moldPath)
    assert.deepEqual(document.mold, this.doc)
