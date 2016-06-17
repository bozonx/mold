mold = require('../../src/index')
PounchDb = require('../../src/drivers/PounchDb').default

testSchema = (pounch) ->
  commonBranch:
    inPounch: pounch.schema({}, {
      doc1: {document: {}, schema: {
        stringParam: {type: 'string'}
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

  it 'set and get', (done) ->
    setPromise = this.container.set('stringParam', 'new value')
    expect(setPromise).to.eventually.notify () =>
      # TODO: set должен вернуть что-то наверное

      getPromise = this.container.get('stringParam')
      expect(getPromise).to.eventually.equal('new value111');
      done()


  # TODO: add
  # TODO: remove
  # TODO: config
