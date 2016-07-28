mutate = require('../../src/mutate').default

describe 'Unit. mutate.', ->
  it 'primitives', ->
    storage =
      container:
        stringValue: 'old value'
        numberValue: 1
        boolValue: false
        arrayValue: ['val1']
        useless: 'it is persistent'

    newData =
      stringValue: 'new value'
      numberValue: 5
      boolValue: true
      arrayValue: ['val1', 'val2']
      newValue: 'new'

    updates = mutate(storage, 'container', newData)

    assert.deepEqual storage, {
      container: _.defaults {
        useless: 'it is persistent'
      }, newData
    }

    # TODO: useless - должен быть unchanged

    assert.deepEqual updates, [
      [
        'container.stringValue'
        'new value'
        'changed'
      ]
      [
        'container.numberValue'
        5
        'changed'
      ]
      [
        'container.boolValue'
        true
        'changed'
      ]
      [
        'container.arrayValue'
        ['val1', 'val2']
        'changed'
      ]
      [
        'container.newValue'
        'new'
        'changed'
      ]
      [
        'container'
        {
          stringValue: 'new value'
          numberValue: 5
          boolValue: true
          arrayValue: ['val1', 'val2']
          newValue: 'new'
        }
        'changed'
      ]
    ]

  # TODO: test from server returns new value, like _id, _rev
  # TODO: test unchanged
  # TODO: test $index
  # TODO: test update to root

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

    updates = mutate(storage, 'container', newData)

    assert.deepEqual storage, {
      container: newData
    }

    assert.deepEqual updates, [
      [
        'container.stringValue'
        'new value'
        'changed'
      ]
      [
        'container.nested.nestedString'
        'new nested value'
        'changed'
      ]
      [
        'container.nested'
        {
          nestedString: 'new nested value'
        }
        'changed'
      ]
      [
        'container'
        {
          stringValue: 'new value'
          nested:
            nestedString: 'new nested value'
        }
        'changed'
      ]
    ]
