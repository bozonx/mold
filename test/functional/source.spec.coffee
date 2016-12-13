mold = require('../../src/index').default

testSchema = () ->
  details:
    type: 'document',
    source: 'collection/${itemId}',
    schema:
      id: {type: 'number'}
      name: {type: 'string'}

describe 'Functional. Source.', ->
  beforeEach () ->
    this.mold = mold( {silent: true}, testSchema() )
    _.set(this.mold.$$schemaManager.$defaultMemoryDb, 'collection[0]', {
      id: 0
      name: 'value0'
    })

  it 'document.load()', ->
    document = this.mold.child('details');
    document.setUrlParams({itemId: 0});
    expect(document.load()).to.eventually
    .deep.equal
      body:
        id: 0
        name: 'value0'
      driverResponse:
        id: 0
        name: 'value0'
      request:
        url: 'collection/0'
        method: 'get'
        moldPath: 'details'
        nodeType: 'container'

  it 'container.save()', (done) ->
    container = this.mold.child('details');
    container.setUrlParams({itemId: 0});
    container.update({id: 0})
    container.update({name: 'new value'})
    expect(container.put()).to.eventually.notify =>
      expect(Promise.resolve(_.get(this.mold.$$schemaManager.$defaultMemoryDb, 'collection[0]'))).to.eventually
      .deep.equal({
        id: 0
        name: 'new value'
      })
      .notify(done)
