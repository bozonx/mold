mold = require('../../src/index')
PounchDb = require('../../src/drivers/PounchDb').default

testSchema = (pounch) ->
  commonBranch:
    inPounch: pounch.schema({}, {
      doc1: {document: {}, schema: {
        stringParam: {type: 'string'}
        arrayParam: {type: 'array'}
      }}
    })

describe 'Functional. PounchDb driver.', ->
  beforeEach ->
    pounch = new PounchDb({
      # main config
    });
    this.testSchema = testSchema(pounch)
    this.mold = mold.initSchema( {}, this.testSchema )
    this.container = this.mold.instance('commonBranch.inPounch.doc1')

  it 'set string', (done) ->
    setPromise = this.container.set('stringParam', 'new value')
    expect(setPromise).to.eventually.have.property('successResponse')
    expect(setPromise).to.eventually.have.property('data')
    expect(setPromise).notify(done)

  it 'set array', (done) ->
    value = [1,2,3]
    expect(this.container.set('arrayParam', value)).notify =>
      getPromise = this.container.get('arrayParam')
      getPromise.then (ddd) ->
        console.log(55555555, ddd)

      expect(getPromise).to.eventually
        .property('data').property('arrayParam').deep.equal(value)
        .notify(done);

  it 'get', (done) ->
    setPromise = this.container.set('stringParam', 'new value')
    expect(setPromise).to.eventually.notify =>
      getPromise = this.container.get('stringParam')
      expect(getPromise).to.eventually
        .property('data').property('stringParam').equal('new value')
        .notify(done);

  # TODO: Do we need add and remove?

  # TODO: config
