Storage = require('../../src/Storage').default
Events = require('../../src/Events').default

# TODO: test event data

describe.only 'Unit. Storage.', ->
  beforeEach ->
    @defaultAction = 'default'
    @events = new Events()
    @storage = new Storage(@events)
    @moldPath = 'path.to[256]'

  describe 'bottom level (solid)', ->
    it 'set new data twice', ->
      bottomHandler = sinon.spy()
      anyHandler = sinon.spy()
      @events.on(@moldPath, 'bottom', bottomHandler)
      @events.on(@moldPath, 'any', anyHandler)
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
      @storage.initState(@moldPath, @defaultAction, {})
      @storage.setBottomLevel(@moldPath, @defaultAction, newData1)
      @storage.setBottomLevel(@moldPath, @defaultAction, newData2)

      expect(@storage.getSolid(@moldPath, @defaultAction)).to.be.deep.equal(newData2)
      expect(bottomHandler).to.be.calledTwice
      expect(anyHandler).to.be.calledTwice

  describe 'top level', ->
    it 'set new data and update it', ->
      changeHandler = sinon.spy()
      anyHandler = sinon.spy()
      @events.on(@moldPath, 'change', changeHandler)
      @events.on(@moldPath, 'any', anyHandler)
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
      @storage.initState(@moldPath, @defaultAction, {})
      @storage.updateTopLevel(@moldPath, @defaultAction, newData1)
      @storage.updateTopLevel(@moldPath, @defaultAction, newData2)

      result = {
        id: 2
        param1: 'value11'
        param2: 'value2'
      }
      expect(@storage.getState(@moldPath, @defaultAction)).to.be.deep.equal(result)
      expect(changeHandler).to.be.calledTwice
      expect(anyHandler).to.be.calledTwice

    it 'updateTopLevelSilent', ->
      silentHandler = sinon.spy()
      anyHandler = sinon.spy()
      @events.on(@moldPath, 'silent', silentHandler)
      @events.on(@moldPath, 'any', anyHandler)
      newData1 = {
        id: 1
        param1: 'value1'
      }

      @storage.$init({})
      @storage.initState(@moldPath, @defaultAction, {})
      @storage.updateTopLevelSilent(@moldPath, @defaultAction, newData1)

      expect(@storage.getState(@moldPath, @defaultAction)).to.be.deep.equal(newData1)
      expect(silentHandler).to.be.calledOnce
      expect(anyHandler).to.be.calledOnce

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
      @storage.initState(@moldPath, @defaultAction, {})
      @storage.setBottomLevel(@moldPath, @defaultAction, bottomData)
      @storage.updateTopLevel(@moldPath, @defaultAction, topData)

      expect(@storage.getSolid(@moldPath, @defaultAction)).to.be.deep.equal(bottomData)
      expect(@storage.getState(@moldPath, @defaultAction)).to.be.deep.equal(topData)
      expect(@storage.getCombined(@moldPath, @defaultAction)).to.be.deep.equal {
        id: 1
        param1: 'value1'
        param2: 'value22'
        param3: 'value3'
      }

    it 'meta', ->
      metaData = {
        param1: 'value1'
      }

      @storage.$init({})
      @storage.updateMeta(@moldPath, @defaultAction, metaData)

      expect(@storage.getMeta(@moldPath, @defaultAction)).to.be.deep.equal(metaData)
      expect(@storage.getMeta(@moldPath, @defaultAction, 'param1')).to.be.deep.equal('value1')
