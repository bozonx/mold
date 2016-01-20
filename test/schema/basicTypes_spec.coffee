basicTypes = require('schema/basicTypes.js')

# TODO: test validate of value or param
# TODO: 'bool with wrong first argument'
# TODO: 'bool with wrong second argument'
# TODO: 'bool with wrong first and second argument'


testType = (type, predefinedValue) ->
  it "#{type} without arguments", ->
    node = basicTypes[type]()
    assert.deepEqual(node, {
      type: type,
      value: null,
    })

  it "#{type} with only predefined value argument", ->
    node = basicTypes[type](predefinedValue)
    assert.deepEqual(node, {
      type: type,
      value: predefinedValue,
    })

  it "#{type} with only params argument", ->
    node = basicTypes[type]({default: true})
    assert.deepEqual(node, {
      type: type,
      value: null,
      default: true,
    })

  it "#{type} with predefined value and params arguments", ->
    node = basicTypes[type](predefinedValue, {default: true})
    assert.deepEqual(node, {
      type: type,
      value: predefinedValue,
      default: true,
    })


describe 'basicTypes', ->
  testType('bool', true)
  testType('int', 5)
  testType('string', 'str')
