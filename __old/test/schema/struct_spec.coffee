mold = require('index.js')

# TODO: test struct validate

describe 'struct', ->
  it 'struct full test', ->
    node = mold.struct {
      stringParam: mold.string('str value')
      secondLevelStruct: mold.struct {
        numberParam: mold.number(7)
      }
    }
    assert.deepEqual(node, {
      type: 'struct',
      children: {
        stringParam: {
          type: 'string'
          value: 'str value'
        },
        secondLevelStruct: {
          type: 'struct'
          children: {
            numberParam: {
              type: 'number'
              value: 7
            }
          }
        }
      },
    })
