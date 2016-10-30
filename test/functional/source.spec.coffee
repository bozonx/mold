mold = require('../../src/index').default

testSchema = () ->
  details:
    document:
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

#  it 'primitive.load()', ->
#    primitive = this.mold.instance('details.name');
#    primitive.setSourceParams({itemId: 0});
#    expect(primitive.load()).to.eventually
#    .deep.equal
#      coocked: 'value0'
#      driverResponse:
#        id: 0
#        name: 'value0'
#      request:
#        document:
#          pathToDocument: 'details'
#          source: 'collection.${itemId}'
#        driverPath:
#          document: 'collection.0'
#          full: 'collection.0'
#        method: 'get'
#        moldPath: 'details'
#        schemaBaseType: 'container'

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

#  it 'primitive.save()', (done) ->
#    primitive = this.mold.instance('details.name');
#    primitive.setSourceParams({itemId: 0});
#    primitive.setMold('new value')
#    expect(primitive.save()).to.eventually.notify =>
#      expect(Promise.resolve(_.get(this.mold.schemaManager.$defaultMemoryDb, 'collection[0].name'))).to.eventually
#      .deep.equal('new value')
#      .notify(done)
#
#  it 'primitive.save() - via container.child. get source from parent', (done) ->
#    container = this.mold.instance('details');
#    primitive = container.child('name');
#    container.setSourceParams({itemId: 0});
#    primitive.setMold('new value')
#    expect(primitive.save()).to.eventually.notify =>
#      expect(Promise.resolve(_.get(this.mold.schemaManager.$defaultMemoryDb, 'collection[0].name'))).to.eventually
#      .deep.equal('new value')
#      .notify(done)

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
