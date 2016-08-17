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
    _.set(this.mold.schemaManager.$defaultMemoryDb, 'collection[0]', {
      id: 0
      name: 'value0'
    })

  it 'primitive.load()', ->
    primitive = this.mold.instance('details.name');
    primitive.setSourceParams({itemId: 0});
    expect(primitive.load()).to.eventually
    .deep.equal
      coocked: 'value0'
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

  it 'container.load()', ->
    container = this.mold.instance('details');
    container.setSourceParams({itemId: 0});
    expect(container.load()).to.eventually
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


# TODO: test container -> child - load and save
# TODO: test container and primitive save
# TODO: test source for collections - load and save
