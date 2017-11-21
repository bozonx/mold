Storage = require('../../src/Storage').default

describe 'Unit. Storage.', ->
  beforeEach ->
    @emitSpy = sinon.spy()
    @eventsMock = {
      emit: @emitSpy
    }
    @storage = new Storage(@eventsMock)
    @moldPath = 'path.to[256]'

  describe 'bottom level', ->
    it 'set new data twice', ->
      newData1 = {
        id: 1
        param1: 'value1'
        param2: 'value2'
      }
      newData2 = {
        id: 2
        param1: 'value11'
      }

      @storage.$init({})
      @storage.setBottomLevel(@moldPath, newData1)
      @storage.setBottomLevel(@moldPath, newData2)

      expect(@storage.get(@moldPath)).to.be.deep.equal(newData2)

  describe 'top level', ->
    it 'set new data and update it', ->
      newData1 = {
        id: 1
        param1: 'value1'
        param2: 'value2'
      }
      newData2 = {
        id: 2
        param1: 'value11'
      }

      @storage.$init({})
      @storage.updateTopLevel(@moldPath, newData1)
      @storage.updateTopLevel(@moldPath, newData2)

      expect(@storage.get(@moldPath)).to.be.deep.equal {
        id: 2
        param1: 'value11'
        param2: 'value2'
      }

    it 'combine with bottom level', ->
      bottomData = {
        id: 1
        param1: 'value1'
        param2: 'value2'
      }
      topData = {
        param2: 'value22'
        param3: 'value3'
      }

      @storage.$init({})
      @storage.setBottomLevel(@moldPath, bottomData)
      @storage.updateTopLevel(@moldPath, topData)

      expect(@storage.get(@moldPath)).to.be.deep.equal {
        id: 1
        param1: 'value1'
        param2: 'value22'
        param3: 'value3'
      }
