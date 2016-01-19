mold = require('index.js')

describe 'schema', ->
  it 'set param', ->
    mold.schema('test', 'val')
    assert.equal(mold.schema('test'), 'val')

