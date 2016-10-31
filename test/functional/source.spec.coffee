mold = require('../../src/index').default

testSchema = () ->
  details:
    type: 'document',
    source: 'collection.${itemId}',
    schema:
      id: {type: 'number'}
      name: {type: 'string'}

describe 'Functional. Source.', ->
  beforeEach () ->
    this.mold = mold( {}, testSchema() )
    _.set(this.mold.schemaManager.$defaultMemoryDb, 'collection[0]', {
      id: 0
      name: 'value0'
    })

  it 'document.load()', ->
    document = this.mold.instance('details');
    document.setSourceParams({itemId: 0});
    expect(document.load()).to.eventually
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

  it 'container.save()', (done) ->
    container = this.mold.instance('details');
    container.setSourceParams({itemId: 0});
    container.setMold('id', 0)
    container.setMold('name', 'new value')
    expect(container.save()).to.eventually.notify =>
      expect(Promise.resolve(_.get(this.mold.schemaManager.$defaultMemoryDb, 'collection[0]'))).to.eventually
      .deep.equal({
        id: 0
        name: 'new value'
      })
      .notify(done)
