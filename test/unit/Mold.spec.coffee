index = require('../../src/index').default
Mold = require('../../src/Mold').default

# TODO: test don't update read only props

describe.only 'Functional. Mold.', ->
  beforeEach () ->
    @moldPath = 'state'
    @index = index( {}, {silent: true} )

    @newInstance = (schema) =>
      @moldInstance = new Mold(@index.$main, @moldPath, 'default', schema);
      @moldInstance.init()

#  it 'initial param.', ->
#    @fullSchema = {
#      type: 'assoc'
#      items: {
#        numberParam: { type: 'number', initial: 5 }
#      }
#    }



#  it 'ro param.', ->
#    @fullSchema = {
#      type: 'assoc'
#      items: {
#        numberParam: { type: 'number', initial: 5, ro: true }
#      }
#    }
#    @moldPath = 'state'
#    @main = mold( {silent: true}, {} )
#    @moldInstance = new Mold(@main, @moldPath, 'default', @fullSchema);
#    @moldInstance.init()
#
#    assert.throws(() => @moldInstance.update({ numberParam: 6 }))
#    assert.throws(() => @moldInstance.updateSilent({ numberParam: 6 }))

  describe 'assoc.', ->
    beforeEach () ->
      @schema = {
        type: 'assoc'
        # TODO: inital может быть здесь
        items: {
          numParam: { type: 'number' }
        }
      }

    it "init - use initial of params", ->
      @newInstance({
        type: 'assoc'
        items: {
          numParam: { type: 'number', initial: 5 }
          strParam: { type: 'string' }
          nested: {
            type: 'assoc'
            items: {
              nestedParam: { type: 'string', initial: 'str' }
            }
          }
        }
      })
      @moldInstance.init()

      assert.deepEqual(@moldInstance.state, {
        numParam: 5
        strParam: undefined
        nested: {
          nestedParam: 'str'
        }
      })

    it "init - use root initial", ->
      @newInstance({
        type: 'assoc'
        initial: {
          numParam: 5
          nested: {
            nestedParam: 'str'
          }
        }
        items: {
          numParam: { type: 'number' }
          nested: {
            type: 'assoc'
            items: {
              nestedParam: { type: 'string', initial: 'overwritten' }
            }
          }
        }
      })
      @moldInstance.init()

      assert.deepEqual(@moldInstance.state, {
        numParam: 5
        nested: {
          nestedParam: 'overwritten'
        }
      })

    it "setSilent - it has to cast before set", ->
      @newInstance({
        type: 'assoc'
        items: {
          numParam1: { type: 'number' }
          numParam2: { type: 'number' }
        }
      })
      @moldInstance.setSilent({ numParam1: '5', numParam2: '6' });
      assert.deepEqual(@moldInstance.state, { numParam1: 5, numParam2: 6 })
      @moldInstance.setSilent({ numParam1: '5' });
      assert.deepEqual(@moldInstance.state, { numParam1: 5 })

    it "update - it has to cast before update", ->
      @newInstance(@schema)
      @moldInstance.update({ numParam: '5' });
      assert.deepEqual(@moldInstance.state, { numParam: 5 })

    it "update - invalid", ->
      @newInstance(@schema)
      assert.throws( () => @moldInstance.update({ numParam: 'str' }) )

    it "updateSilent - it has to cast before update", ->
      @newInstance(@schema)
      @moldInstance.updateSilent({ numParam: '5' });
      assert.deepEqual(@moldInstance.state, { numParam: 5 })

    it "read only simple", ->
      @newInstance({
        type: 'assoc'
        items: {
          roParam: { type: 'number', ro: true }
        }
      })

      assert.throws(() => @moldInstance.setSilent({ roParam: 6 }))
      assert.throws(() => @moldInstance.update({ roParam: 6 }))
      assert.throws(() => @moldInstance.updateSilent({ roParam: 6 }))

    it "read only", ->
      @newInstance({
        type: 'assoc'
        items: {
          arrParam: {
            type: 'array'
            item: {
              type: 'assoc'
              items: {
                param: { type: 'number', ro: true }
              }
            }
          }
        }
      })

      assert.throws(() => @moldInstance.update({
        arrParam: [
          {
            param: 5
          }
        ]
      }))

  describe 'collection.', ->
    beforeEach () ->
      @schema = {
        type: 'array'
        item: {
          type: 'assoc',
          items: {
            numParam1: { type: 'number' }
            numParam2: { type: 'number' }
          },
        }
      }


    it "init - use root initial", ->
      @newInstance({
        type: 'array'
        initial: [
          {
            numParam: 5
            nested: {
              nestedParam: 'str'
            }
          }
        ]
        item: {
          numParam: { type: 'number' }
          nested: {
            type: 'assoc'
            items: {
              nestedParam: { type: 'string' }
            }
          }
        }
      })
      @moldInstance.init()

      assert.deepEqual(@moldInstance.state, [
        {
          numParam: 5
          nested: {
            nestedParam: 'str'
          }
        }
      ])

    it "setSilent - it has to cast before set", ->
      @newInstance(@schema)
      @moldInstance.setSilent([{ numParam1: '5', numParam2: '6' }]);
      assert.deepEqual(@moldInstance.state, [{ numParam1: 5, numParam2: 6 }])
      @moldInstance.setSilent([{ numParam1: '5' }]);
      assert.deepEqual(@moldInstance.state, [{ numParam1: 5 }])


    it "update - it has to cast before update", ->
      @newInstance(@schema)
      @moldInstance.update([ { numParam1: '5' } ]);
      assert.deepEqual(@moldInstance.state, [ { numParam1: 5 } ])

    it "update - invalid", ->
      @newInstance(@schema)
      assert.throws( () => @moldInstance.update([ { numParam1: 'str' } ]) )

    it "updateSilent - it has to cast before update", ->
      @newInstance(@schema)
      @moldInstance.updateSilent([ { numParam1: '5' } ]);
      assert.deepEqual(@moldInstance.state, [ { numParam1: 5 } ])
