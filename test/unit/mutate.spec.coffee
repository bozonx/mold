mutate = require('../../src/mutate').default

describe 'Unit. mutate.', ->
  describe 'containers and primitives updates', ->
    it 'all types of primitives', ->
      storage =
        container:
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
      mutate(storage, 'container').update(newData)

      assert.deepEqual(storage, { container: newData })

    it 'unchanged values - nothing to change', ->
      storage =
        container:
          unchangedValue: 'old value'
      newData =
        unchangedValue: 'old value'
      haveChanges = mutate(storage, 'container').update(newData)

      assert.deepEqual(storage, { container: newData })
      assert.isFalse(haveChanges)

    it 'unchanged values - change partly', ->
      storage =
        container:
          unchangedValue: 'old value'
          changedValue: 'old value'
      newData =
        unchangedValue: 'old value'
        changedValue: 'new value'
      haveChanges = mutate(storage, 'container').update(newData)

      assert.deepEqual(storage, { container: newData })
      assert.isTrue(haveChanges)

    it 'untouched value', ->
      storage =
        container:
          untouchedValue: 'untouched value'
          changedValue: 'old value'
      newData =
        changedValue: 'new value'
      haveChanges = mutate(storage, 'container').update(newData)

      assert.deepEqual storage, {
        container:
          untouchedValue: 'untouched value'
          changedValue: 'new value'
      }
      assert.isTrue(haveChanges)

    it 'server returns _id additionally', ->
      storage =
        container:
          changedValue: 'old value'
      newData =
        changedValue: 'new value'
        _id: 'container'
      mutate(storage, 'container').update(newData)

      assert.deepEqual storage, {
        container:
          changedValue: 'new value'
          _id: 'container'
      }

    it 'nested container', ->
      storage =
        container:
          stringValue: 'old value'
          nested:
            nestedString: 'old nested value'
      newData =
        stringValue: 'new value'
        nested:
          nestedString: 'new nested value'
      mutate(storage, 'container').update(newData)

      assert.deepEqual(storage, { container: newData })

    it 'update from root', ->
      storage =
        container:
          stringValue: 'old value'
      newData =
        container:
          stringValue: 'new value'
      mutate(storage, '').update(newData)

      assert.deepEqual(storage, newData)


  describe 'primitive and clean array updates', ->
    it 'primitive array', ->
      storage =
        arrayParam: ['oldValue']
      newData = [undefined, 'newValue1', 'newValue2']
      haveChanges = mutate(storage).update({ arrayParam: newData })

      assert.deepEqual(storage, { arrayParam: newData })
      assert.isTrue(haveChanges)

    it 'primitive array - new array is shorter', ->
      storage =
        arrayParam: ['oldValue1', 'oldValue2', 'oldValue3']
      newData = [undefined, 'newValue2']
      haveChanges = mutate(storage).update({ arrayParam: newData })

      assert.deepEqual(storage, { arrayParam: newData })
      assert.isTrue(haveChanges)

    it 'no one changes', ->
      storage =
        arrayParam: ['value1']
      newData = ['value1']
      haveChanges = mutate(storage).update({ arrayParam: newData })

      assert.deepEqual(storage, { arrayParam: newData })
      assert.isFalse(haveChanges)

    it '_cleanArray', ->
      storage =
        arrayParam: ['oldValue']
      haveChanges = mutate(storage).update({ arrayParam: [] })

      assert.deepEqual(storage, { arrayParam: [] })
      assert.isTrue(haveChanges)

    it '_cleanArray - no changes', ->
      storage =
        arrayParam: []
      haveChanges = mutate(storage).update({ arrayParam: [] })

      assert.deepEqual(storage, { arrayParam: [] })
      assert.isFalse(haveChanges)


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
      haveChanges = mutate(storage, 'collection').update(newData)

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
      haveChanges = mutate(storage, 'collection').update(newData)

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
      haveChanges = mutate(storage, 'collection').update([])

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
      haveChanges = mutate(storage, 'collection').update(newData)

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
      haveChanges = mutate(storage, 'collection').update(newData)

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
      haveChanges = mutate(storage, 'collection[0]').update(newData)

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
      haveChanges = mutate(storage, 'collection').update(newData)

      assert.deepEqual(storage, { collection: storage.collection })
      assert.isFalse(haveChanges)
