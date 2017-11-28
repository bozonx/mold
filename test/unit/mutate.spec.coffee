mutate = require('../../src/mutate').mutate

describe.only 'Unit. mutate.', ->
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
          id: 5
          name: 'new item'
        }
      ]
      haveChanges = mutate(storage, 'collection').combine(newData)

      assert.deepEqual(storage, { collection: [
        {
          $index: 0
          id: 5
          name: 'new item'
        }
      ] })
      assert.isTrue(haveChanges)

    it 'reduce collection size', ->
      storage =
        collection: [
          undefined
          {
            $index: 0
            id: 0
            name: 'old item'
          }
        ]
      newData = [
        {
          id: 1
          name: 'new item'
        }
        undefined,
      ]
      haveChanges = mutate(storage, 'collection').combine(newData)

      assert.deepEqual(storage, { collection: [
        {
          $index: 0
          id: 1
          name: 'new item'
        }
        undefined,
      ] })
      assert.isTrue(haveChanges)

    it 'clean a collection', ->
      storage =
        collection: [
          {
            $index: 0
            id: 5
            name: 'new item'
          }
        ]
      haveChanges = mutate(storage, 'collection').combine([])

      assert.deepEqual(storage, { collection: [] })
      assert.isTrue(haveChanges)

    it 'replace - new data is greater', ->
      storage =
        collection: [
          {
            $index: 0,
            id: 5
            name: 'this will be replaced'
          }
          {
            $index: 1,
            id: 6
            name: 'this will be replaced'
          }
        ]
      newData = [
        undefined,
        {
          id: 6
          name: 'new item'
        }
        {
          id: 7
          name: 'new item'
        }
        {
          id: 8
          name: 'new item'
        }
      ]
      haveChanges = mutate(storage, 'collection').combine(newData)

      assert.deepEqual(storage, { collection: [
        undefined,
        {
          $index: 1,
          id: 6
          name: 'new item'
        }
        {
          $index: 2,
          id: 7
          name: 'new item'
        }
        {
          $index: 3,
          id: 8
          name: 'new item'
        }
      ] })
      assert.isTrue(haveChanges)

    it 'replace - new data is less', ->
      storage =
        collection: [
          {
            $index: 0,
            id: 5
            name: 'this will be replaced'
          }
          undefined,
          {
            $index: 1,
            id: 6
            name: 'this will be stay untouched'
          }
        ]
      newData = [
        {
          id: 6
          name: 'new item'
        }
      ]
      haveChanges = mutate(storage, 'collection').combine(newData)

      assert.deepEqual(storage, { collection: [
        {
          $index: 0,
          id: 6
          name: 'new item'
        }
      ] })
      assert.isTrue(haveChanges)

    it 'collection item change on updating item himself via container "collection[0]"', ->
      storage =
        collection: [
          {
            $index: 0
            id: 5
            name: 'old item'
          }
        ]
      newData = {
        id: 5
        name: 'new item'
      }
      haveChanges = mutate(storage, 'collection[0]').combine(newData)

      assert.deepEqual(storage, { collection: [
        {
          $index: 0
          id: 5
          name: 'new item'
        }
      ] })
      assert.isTrue(haveChanges)

    it 'unchanged', ->
      storage =
        collection: [
          {
            $index: 0
            id: 5
            name: 'old item'
          }
        ]
      newData = [
        {
          $index: 0
          id: 5
          name: 'old item'
        }
      ]
      haveChanges = mutate(storage, 'collection').combine(newData)

      assert.deepEqual(storage, { collection: storage.collection })
      assert.isFalse(haveChanges)
