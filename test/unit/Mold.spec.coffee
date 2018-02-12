mold = require('../../src/index').default
Mold = require('../../src/Mold').default

# TODO: test don't update read only props

describe 'Functional. Mold.', ->
  it 'initial param.', ->
    @fullSchema = {
      type: 'assoc'
      items: {
        numberParam: { type: 'number', initial: 5 }
      }
    }
    @moldPath = 'state'
    @main = mold( {}, {silent: true} )
    @moldInstance = new Mold(@main, @moldPath, 'default', @fullSchema);
    @moldInstance.init()

    assert.deepEqual(@moldInstance.state, {
      numberParam: 5
    })

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
      @fullSchema = {
        type: 'assoc'
        items: {
          numberParam: { type: 'number' }
        }
      }
      @moldPath = 'state'
      @main = mold( {}, {silent: true} )
      @moldInstance = new Mold(@main, @moldPath, 'default', @fullSchema);
      @moldInstance.init()

    it "init", ->
      assert.deepEqual(@moldInstance.state, {
        numberParam: undefined
      })

    it "update - it has to cast before update", ->
      @moldInstance.update({ numberParam: '5' });
      assert.deepEqual(@moldInstance.state, {
        numberParam: 5
      })

    it "updateSilent - it has to cast before update", ->
      @moldInstance.updateSilent({ numberParam: '5' });
      assert.deepEqual(@moldInstance.state, {
        numberParam: 5
      })

#  describe 'collection.', ->
#    beforeEach () ->
#      @fullSchema = {
#        type: 'collection'
#        item: {
#          numberParam: { type: 'number' }
#        }
#      }
#      @moldPath = 'collection'
#      @main = mold( {}, {silent: true} )
#      @moldInstance = new Mold(@main, @moldPath, 'default', @fullSchema);
#      @moldInstance.init()
#
#    it "init", ->
#      assert.deepEqual(@moldInstance.state, [])
#
#    it "update - it has to cast before update", ->
#      @moldInstance.update([ { numberParam: '5' } ]);
#      assert.deepEqual(@moldInstance.state, [
#        { numberParam: 5 }
#      ])
#
#    it "updateSilent - it has to cast before update", ->
#      @moldInstance.updateSilent([ { numberParam: '5' } ]);
#      assert.deepEqual(@moldInstance.state, [
#        { numberParam: 5 }
#      ])
