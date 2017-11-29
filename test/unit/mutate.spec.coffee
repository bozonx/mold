mutate = require('../../src/mutate').mutate

describe 'Unit. mutate.', ->
  describe 'containers and primitives updates', ->
    it 'all types of primitives', ->
      storage =
        stringValue: 'old value'
        numberValue: 1
        boolValue: false
        arrayValue: ['val1']
      newData =
        stringValue: 'new value'
        numberValue: 5
        boolValue: true
        arrayValue: ['val1', 'val2']
        newValue: 'new'
      mutate(storage).combine(newData)

      assert.deepEqual(storage, newData)

    it 'unchanged, changed, odd and new values - change partly', ->
      storage =
        unchangedValue: 'old value'
        changedValue: 'old value'
        oddValue: 'odd value'
      newData =
        unchangedValue: 'old value'
        changedValue: 'new value'
        newValue: 'new value'
      mutate(storage).combine(newData)

      assert.deepEqual(storage, newData)

    it 'nested container', ->
      storage =
        stringValue: 'old value'
        nested:
          nestedString: 'old nested value'
      newData =
        stringValue: 'new value'
        nested:
          nestedString: 'new nested value'
      mutate(storage).combine(newData)

      assert.deepEqual(storage, newData)

  describe 'primitive and clean array updates', ->
    it 'primitive array', ->
      storage =
        arrayParam: ['oldValue']
      newData = [undefined, 'newValue1', 'newValue2']
      mutate(storage).combine({ arrayParam: newData })

      assert.deepEqual(storage, { arrayParam: newData })

    it 'primitive array - new array is shorter', ->
      storage =
        arrayParam: ['oldValue1', 'oldValue2', 'oldValue3']
      newData = [undefined, 'newValue2']
      mutate(storage).combine({ arrayParam: newData })

      assert.deepEqual(storage, { arrayParam: newData })

    it '_cleanArray', ->
      storage =
        arrayParam: ['oldValue']
      mutate(storage).combine({ arrayParam: [] })

      assert.deepEqual(storage, { arrayParam: [] })


  describe 'Collections updates', ->
    it 'init', ->
      storage =
        collection: []
      newData = [
        {
          $$key: 5
          name: 'new item'
        }
      ]
      mutate(storage, 'collection').combine(newData)

      assert.deepEqual(storage, { collection: [
        {
          $$key: 5
          name: 'new item'
        }
      ] })

    it 'reduce collection size', ->
      storage =
        collection: [
          undefined
          {
            $$key: 0
            name: 'old item'
          }
        ]
      newData = [
        {
          $$key: 1
          name: 'new item'
        }
      ]
      mutate(storage, 'collection').combine(newData)

      assert.deepEqual(storage, { collection: [
        {
          $$key: 1
          name: 'new item'
        }
      ] })

    it 'update and unchanged', ->
      storage =
        collection: [
          {
            $$key: 0
            name: 'unchanged'
          }
          {
            $$key: 1
            name: 'old'
          }
        ]
      newData =
        collection:  [
          {
            $$key: 0
            name: 'unchanged'
          }
          {
            $$key: 1
            name: 'updated'
          }
        ]
      mutate(storage).combine(newData)

      assert.deepEqual(storage, newData)

    it 'clean a collection', ->
      storage =
        collection: [
          {
            $$key: 5
            name: 'new item'
          }
        ]
      mutate(storage, 'collection').combine([])

      assert.deepEqual(storage, { collection: [] })


  # TODO: check reordered on server
