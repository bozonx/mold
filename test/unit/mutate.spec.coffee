mutate = require('../../src/mutate').default

describe 'Unit. mutate.', ->
  describe 'containers and primitives', ->
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


  describe 'Collections', ->
    it 'collection init (add from server)', ->
      storage =
        collection: []

      newData = [
        {
          id: 5
          name: 'new item'
        }
      ]

      mutate(storage, 'collection').update(newData)

      assert.deepEqual(storage, { collection: [
        {
          $index: 0
          id: 5
          name: 'new item'
        }
      ] })

    it 'collection remove and add (originally replace)', ->
      storage =
        collection: [
          {
            $index: 0,
            id: 5
            name: 'to remove item'
          }
          {
            $index: 1,
            id: 6
            name: 'old item'
          }
        ]

      newData = [
        {
          id: 6
          name: 'old item'
        }
        {
          id: 7
          name: 'new item'
        }
      ]

      mutate(storage, 'collection').update(newData)

      assert.deepEqual(storage, { collection: [
        {
          $index: 0,
          id: 6
          name: 'old item'
        }
        {
          $index: 1,
          id: 7
          name: 'new item'
        }
      ] })

    it 'collection item change on updating collection', ->
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
          id: 5
          name: 'new item'
        }
      ]

      mutate(storage, 'collection').update(newData)

      assert.deepEqual(storage, { collection: [
        {
          $index: 0
          id: 5
          name: 'new item'
        }
      ] })

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

      mutate(storage, 'collection[0]').update(newData)

      assert.deepEqual(storage, { collection: [
        {
          $index: 0
          id: 5
          name: 'new item'
        }
      ] })

    it 'collection item change on updating item himself via primitive "collection[0].name"', ->
      storage =
        collection: [
          {
            $index: 0
            id: 5
            name: 'old item'
          }
        ]

      newData = 'new item'

      mutate(storage, 'collection[0].name').update(newData)

      assert.deepEqual(storage, { collection: [
        {
          $index: 0
          id: 5
          name: 'new item'
        }
      ] })
