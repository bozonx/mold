#basicTypes = require('schema/basicTypes.js')
mold = require('index.js')

# TODO: test validate of value or param
# TODO: 'boolean with wrong first argument'
# TODO: 'boolean with wrong second argument'
# TODO: 'boolean with wrong first and second argument'


testType = (type, predefinedValue) ->
  it "#{type} without arguments", ->
    node = mold[type]()
    assert.deepEqual(node, {
      type: type,
      value: null,
    })

  it "#{type} with only predefined value argument", ->
    node = mold[type](predefinedValue)
    assert.deepEqual(node, {
      type: type,
      value: predefinedValue,
    })

  it "#{type} with only params argument", ->
    node = mold[type]({default: true})
    assert.deepEqual(node, {
      type: type,
      value: null,
      default: true,
    })

  it "#{type} with predefined value and params arguments", ->
    node = mold[type](predefinedValue, {default: true})
    assert.deepEqual(node, {
      type: type,
      value: predefinedValue,
      default: true,
    })


describe 'basicTypes', ->
  testType('boolean', true)
  testType('number', 5)
  testType('string', 'str')
