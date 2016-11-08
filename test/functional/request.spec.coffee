mold = require('../../src/index').default

describe 'Functional. Request.', ->
  beforeEach () ->
    testSchema = () ->
      collection:
        type: 'documentsCollection'
        item:
          type: 'document'
          schema:
            id: {type: 'number', primary: true}
            stringParam: {type: 'string'}

    this.mold = mold( {}, testSchema() )

  describe 'Document.', ->
    it "Load", ->
      _.set(this.mold.$$schemaManager.$defaultMemoryDb, 'collection[0]', {
        stringParam: 'value'
      })
      container = this.mold.instance('collection[0]')
      promise = container.load()
