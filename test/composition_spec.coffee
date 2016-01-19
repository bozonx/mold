mold = require('index.js')

# TODO: test validate in set function

describe 'composition', ->
  it 'simple set value', ->
    mold.set('parent.child', 'value')
    assert.equal(mold.composition('parent.child'), 'value')
