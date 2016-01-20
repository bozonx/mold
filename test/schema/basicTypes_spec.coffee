basicTypes = require('schema/basicTypes.js')

# TODO: test validate of value or param

describe 'basicTypes', ->
  it 'bool without arguments', ->
    node = basicTypes.bool()
    assert.deepEqual(node, {
      type: 'bool',
      value: null,
    })

  it 'bool with only predefined value argument', ->
    node = basicTypes.bool(true)
    assert.deepEqual(node, {
      type: 'bool',
      value: true,
    })

  it 'bool with only params argument', ->
    node = basicTypes.bool({default: true})
    assert.deepEqual(node, {
      type: 'bool',
      value: null,
      default: true,
    })

  it 'bool with predefined value and params arguments', ->
    node = basicTypes.bool(false, {default: true})
    assert.deepEqual(node, {
      type: 'bool',
      value: false,
      default: true,
    })

  # TODO: 'bool with wrong first argument'
  # TODO: 'bool with wrong second argument'
  # TODO: 'bool with wrong first and second argument'
