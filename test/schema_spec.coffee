mold = require('index.js')

# TODO: test composition after set schema

describe 'schema', ->
  it 'set/get simple schema', ->
    # TODO: по идее нельзя записывать произвольные данные в схему, можно только mold.struct и тд
    # TODO: данные схемы можно получить только по узлам mold.struct и тд а не любое значение
    sch = {param1: 'value1'};
    mold.schema('parent.child', sch);
    assert.equal(mold.schema('parent.child'), sch)
    assert.isUndefined(mold.schema('parent.notExists'))

  it 'another require of mold must return same value of first require', ->
    mm = require('index.js')
    assert.equal(mm.schema().parent.child.param1, 'value1')

describe 'struct and basic values', ->
  beforeEach ->
    this.schema = mold.struct 'first', {
      intValue: mold.int(5),
      boolValueTrue: mold.bool(true),
      boolValueFalse: mold.bool(false),
      stringValue: mold.string('string value'),
      innerStruct: mold.struct {
        innerStructInt: mold.int(7)
      }
    }

#  it 'first.intValue', ->
#    assert.deepEqual(mold.schema('first.intValue'), {
#      type: 'int',
#      # preset value
#      value: 5
#    })
