helpers = require('../../src/helpers')

describe 'Unit. helpers.', ->
  describe 'recursiveMutate.', ->
    it 'primitive update', ->
      sourceData =
        stringValue: 'stringValue top'
        numberValue: 5
        boolValue: false
        nullValue: null
        useless: 'it is going to remove'

      newData =
        stringValue: 'new value'
        numberValue: 6
        boolValue: true
        nullValue: false
        newValue: 'new'

      helpers.recursiveMutate(sourceData, newData)

      assert.deepEqual(sourceData, newData)

    it 'Nested object update', ->
      sourceData =
        stringValue: 'top',
        nested:
          stringValue: 'nested'
          useless: 'it is going to remove'
          uselessNested:
            stringValue: 'very nested'

      newData =
        stringValue: 'new',
        nested:
          stringValue: 'new'
          nestedSecond:
            stringValue: 'new'

      topLink = sourceData.stringValue
      nestedLink = sourceData.nested
      nestedValueLink = sourceData.nested.stringValue

      helpers.recursiveMutate(sourceData, newData)

      assert.deepEqual(sourceData, newData)

    # TODO: array
    # TODO: collection
