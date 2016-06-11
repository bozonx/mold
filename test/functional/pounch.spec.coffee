mold = require('../../src/index')
PounchDb = require('../../src/drivers/PounchDb')

# TODO: можно задавать несколько инстансов с разными локальными конфигами
# TODO: можно делать вложенные инстансы с разными конфигами

testSchema = (pounch) ->
  commonBranch:
    inPounch: pounch.schema({}, {
      param1: {type: 'string'}
      listParam:
        type: 'list'
        item: {
          id: {type: 'number'}
          name: {type: 'string'}
        }
    })

describe 'Functional. PounchDb driver.', ->
  beforeEach ->
    pounch = new PounchDb({
      # main config
    });
    this.schema = testSchema(pounch)
    
    
  it 'simple use', ->
    
