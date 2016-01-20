mold = require('index.js')

# TODO: test composition after set schema

describe 'schema', ->
#  it 'set/get simple schema', ->
#    # TODO: по идее нельзя записывать произвольные данные в схему, можно только mold.struct и тд
#    # TODO: данные схемы можно получить только по узлам mold.struct и тд а не любое значение
#    sch = {param1: 'value1'};
#    mold.schema('parent.child', sch);
#    assert.equal(mold.schema('parent.child'), sch)
#    assert.isUndefined(mold.schema('parent.notExists'))

#  it 'another require of mold must return same value of first require', ->
#    mm = require('index.js')
#    assert.equal(mm.schema().parent.child.param1, 'value1')

describe 'full struct and basic values', ->
  beforeEach ->
    this.schema = mold.struct {
      numberValue: mold.number(5),
      booleanValueTrue: mold.boolean(true),
      booleanValueFalse: mold.boolean(false),
      stringValue: mold.string('str value'),
      innerStruct: mold.struct {
        innerStructNumber: mold.number(7)
      }
    }

  it 'root/first', ->
    mold.schema('first', this.schema)
    assert.deepEqual mold.schema('first'), {
      type: 'struct'
      children: {
        numberValue: {type: 'number', value: 5}
        booleanValueTrue: {type: 'boolean', value: true}
        booleanValueFalse: {type: 'boolean', value: false}
        stringValue: {type: 'string', value: 'str value'}
        innerStruct: {
          type: 'struct'
          children: {
            innerStructNumber: {
              type: 'number'
              value: 7
            }
          }
        }
      }
    }

  it 'first.numberValue', ->
    mold.schema('first', this.schema)
    assert.deepEqual(mold.schema('first.numberValue'), {type: 'number', value: 5})
