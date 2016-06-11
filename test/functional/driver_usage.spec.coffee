mold = require('../../src/index')
LocalStorage = require('../../src/drivers/LocalStorage')

# TODO: можно задавать несколько инстансов с разными локальными конфигами
# TODO: можно делать вложенные инстансы с разными конфигами

testSchema = (localStorage) ->
  commonBranch:
    inLocalStorage: localStorage.schema({}, {
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
    localStorage = new LocalStorage({});
    this.schema = testSchema(localStorage)


it 'simple use', ->
