mutate = require('../../src/mutate').default

describe 'Unit. mutate.', ->
  it 'primitive update', ->
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
