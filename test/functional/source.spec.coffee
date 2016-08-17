mold = require('../../src/index')

testSchema = () ->
  details:
    document:
      source: 'collection.${itemId}',
    schema:
      id: {type: 'number'}
      name: {type: 'string'}

describe 'Functional. Source.', ->
  beforeEach () ->
    this.mold = mold.initSchema( {}, testSchema() )
    this.details = this.mold.instance('details');
    _.set(this.mold.schemaManager.$defaultMemoryDb, 'collection[0]', {
      id: 0
      name: 'value0'
    })

  it 'container.load()', ->
    this.details.setSourceParams({itemId: 0});
    expect(this.details.load()).to.eventually
      .deep.equal
        coocked:
          id: 0
          name: 'value0'
        driverResponse:
          id: 0
          name: 'value0'
        request:
              document:
                pathToDocument: 'details'
                source: 'collection.${itemId}'
              driverPath:
                document: 'collection.0'
                full: 'collection.0'
              method: 'get'
              moldPath: 'details'
              schemaBaseType: 'container'
