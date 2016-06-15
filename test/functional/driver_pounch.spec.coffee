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

  it 'set and get', ->
    this.container.set('stringParam', 'new value')
    # TODO: get в промисе


  # TODO: add
  # TODO: remove
  # TODO: config
