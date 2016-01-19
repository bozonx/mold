mold = require('index.js')

# TODO: test composition after set schema

describe 'schema', ->
  it 'set/get simple schema', ->
    sch = {param1: 'value1'};
    mold.schema('parent.child', sch);
    assert.equal(mold.schema('parent.child'), sch)
    assert.isUndefined(mold.schema('parent.notExists'))

  it 'another require of mold must return same value of first require', ->
    mm = require('index.js')
    assert.equal(mm.schema().parent.child.param1, 'value1')
