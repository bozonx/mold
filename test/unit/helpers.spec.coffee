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
        stringValue: 'new1',
        nested:
          stringValue: 'new2'
          nestedSecond:
            stringValue: 'new3'

      nestedLink = sourceData.nested

      helpers.recursiveMutate(sourceData, newData)

      assert.deepEqual(sourceData, newData)
      assert.equal(nestedLink.stringValue, 'new2')

    it 'Collection update', ->
      sourceData =
        collection: [
          {
            id: 1
            name: 'old name'
            unusedField: 'unused'
          }
          {
            id: 2
            name: 'unused'
          }
        ],
        toClear: [
          {
            id: 1
          }
        ],

      newData =
        collection: [
          {
            id: 1
            name: 'new'
            newField: 'new',
          }
        ],
        toClear: []
        newCollection: [
          {
            id: 1,
            name: 'new'
          }
        ],

      collectionLink = sourceData.collection

      helpers.recursiveMutate(sourceData, newData)

      assert.deepEqual(sourceData, newData)
      assert.equal(collectionLink[0].name, 'new')


    # TODO: array, массив вложенный в массив
    # TODO: collection at start, deep
