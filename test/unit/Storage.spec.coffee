Storage = require('../../src/Storage').default


describe 'Unit. Storage.', ->
  beforeEach ->
    @defaultAction = 'default'
    @storage = new Storage()
    @events = @storage._events
    @moldPath = 'path.to[256]'

  it "initAction with plain object", ->
    @storage.$init()
    @storage.initAction(@moldPath, @defaultAction, {})

    assert.deepEqual(@storage.getAction(@moldPath, @defaultAction), {
      state: {},
      solid: {},
      combined: {},
      meta: {},
    })

  it "initAction with plain array", ->
    @storage.$init()
    @storage.initAction(@moldPath, @defaultAction, [])

    assert.deepEqual(@storage.getAction(@moldPath, @defaultAction), {
      state: [],
      solid: [],
      combined: [],
      meta: {},
    })

  it "setStateLayerSilent", ->
    handlerChange = sinon.spy()
    handlerAnyChange = sinon.spy()
    @storage.$init()
    @storage.initAction(@moldPath, @defaultAction, {})
    @storage.onChangeAction(@moldPath, @defaultAction, handlerChange)
    @storage.onAnyChangeAction(@moldPath, @defaultAction, handlerAnyChange)

    @storage.setStateLayerSilent(@moldPath, @defaultAction, { name: 'value' })
    assert.deepEqual(@storage.getState(@moldPath, @defaultAction), { name: 'value' })
    assert.deepEqual(@storage.getCombined(@moldPath, @defaultAction), { name: 'value' })

    sinon.assert.notCalled(handlerChange);
    sinon.assert.calledOnce(handlerAnyChange);


  it "setSolidLayer with object", ->
    handlerChange = sinon.spy()
    handlerAnyChange = sinon.spy()
    @storage.$init()
    @storage.initAction(@moldPath, @defaultAction, {})
    @storage.on(@storage._getEventName( @storage._getFullPath(@moldPath, @defaultAction), 'solid' ), handlerChange)
    @storage.onAnyChangeAction(@moldPath, @defaultAction, handlerAnyChange)

    @storage.setStateLayerSilent @moldPath, @defaultAction, {
      name: 'value'
      nested: {
        param: {
          name: 'oldNestedName'
        }
      }
      arr: [ [1], 2 ]
      odd: 'oddValue'
    }
    @storage.setSolidLayer @moldPath, @defaultAction, {
      name: 'newValue'
      nested: {
        param: {
          name: 'newNestedName'
        }
      }
      arr: [ [3], 4 ]
    }

    assert.deepEqual @storage.getState(@moldPath, @defaultAction), {
      odd: 'oddValue'
    }

    assert.deepEqual @storage.getCombined(@moldPath, @defaultAction), {
      name: 'newValue'
      nested: {
        param: {
          name: 'newNestedName'
        }
      }
      arr: [ [3], 4 ]
      odd: 'oddValue'
    }

    sinon.assert.calledOnce(handlerChange);
    sinon.assert.calledTwice(handlerAnyChange);

  it "setSolidLayer with array", ->
    @storage.$init()
    @storage.initAction(@moldPath, @defaultAction, {})

    @storage.setStateLayerSilent @moldPath, @defaultAction, [
      {
        name: 'value'
        nested: {
          param: {
            name: 'oldNestedName'
          }
        }
        arr: [ [1], 2 ]
        odd: 'oddValue'
      }
    ]
    @storage.setSolidLayer @moldPath, @defaultAction, [
      {
        name: 'newValue'
        nested: {
          param: {
            name: 'newNestedName'
          }
        }
        arr: [ [3], 4 ]
      }
    ]

    assert.deepEqual @storage.getState(@moldPath, @defaultAction), [
      {
        odd: 'oddValue'
      }
    ]

    assert.deepEqual @storage.getCombined(@moldPath, @defaultAction), [
      {
        name: 'newValue'
        nested: {
          param: {
            name: 'newNestedName'
          }
        }
        arr: [ [3], 4 ]
        odd: 'oddValue'
      }
    ]


  it "updateStateLayer with objects", ->
    handlerChange = sinon.spy()
    handlerAnyChange = sinon.spy()
    @storage.$init()
    @storage.initAction(@moldPath, @defaultAction, {})
    @storage.onChangeAction(@moldPath, @defaultAction, handlerChange)
    @storage.onAnyChangeAction(@moldPath, @defaultAction, handlerAnyChange)

    @storage.setStateLayerSilent @moldPath, @defaultAction, {
      name: 'newValue'
      nested: {
        param: {
          name: 'nestedName'
        }
      }
      arr: [ [1], 2 ]
    }

    @storage.updateStateLayer @moldPath, @defaultAction, {
      nested: {
        param: {
          name2: 'newNestedName2'
        }
      }
      arr: [ [3] ]
    }

    assert.deepEqual @storage.getState(@moldPath, @defaultAction), {
      name: 'newValue'
      nested: {
        param: {
          name2: 'newNestedName2'
        }
      }
      arr: [ [3] ]
    }

    sinon.assert.calledOnce(handlerChange);
    sinon.assert.calledTwice(handlerAnyChange);

  it "updateStateLayer with arrays", ->
    handlerChange = sinon.spy()
    handlerAnyChange = sinon.spy()
    @storage.$init()
    @storage.initAction(@moldPath, @defaultAction, {})
    @storage.onChangeAction(@moldPath, @defaultAction, handlerChange)
    @storage.onAnyChangeAction(@moldPath, @defaultAction, handlerAnyChange)

    @storage.setStateLayerSilent @moldPath, @defaultAction, [
      {
        name: 'newValue'
        nested: {
          param: {
            name: 'nestedName'
          }
        }
        arr: [ [1], 2 ]
      }
    ]

    @storage.updateStateLayer @moldPath, @defaultAction, [
      {
        nested: {
          param: {
            name2: 'newNestedName2'
          }
        }
        arr: [ [3] ]
      }
    ]

    assert.deepEqual @storage.getState(@moldPath, @defaultAction), [
      {
        name: 'newValue'
        nested: {
          param: {
            name2: 'newNestedName2'
          }
        }
        arr: [ [3] ]
      }
    ]

    sinon.assert.calledOnce(handlerChange);
    sinon.assert.calledTwice(handlerAnyChange);


  it "_generateCombined with objects", ->
    @storage.$init()
    @storage.initAction(@moldPath, @defaultAction, {})

    @storage.setSolidLayer @moldPath, @defaultAction, {
      name: 'value'
      nested: {
        param: {
          name: 'oldNestedName'
        }
      }
      arr: [ [1], 2, 3 ]
      odd: 'oddValue'
    }
    @storage.setStateLayerSilent @moldPath, @defaultAction, {
      name: 'newValue'
      nested: {
        param: {
          name: 'newNestedName'
        }
      }
      arr: [ [3], 4 ]
      oddState: 'oddValue'
    }

    assert.deepEqual @storage.getCombined(@moldPath, @defaultAction), {
      name: 'newValue'
      nested: {
        param: {
          name: 'newNestedName'
        }
      }
      arr: [ [3], 4, 3 ]
      odd: 'oddValue'
      oddState: 'oddValue'
    }

  it "_generateCombined with arrays", ->
    @storage.$init()
    @storage.initAction(@moldPath, @defaultAction, [])

    @storage.setSolidLayer @moldPath, @defaultAction, [
      {
        name: 'value'
        nested: {
          param: {
            name: 'oldNestedName'
          }
        }
        arr: [ [1], 2, 3 ]
        odd: 'oddValue'
      }
    ]

    @storage.setStateLayerSilent @moldPath, @defaultAction, [
      {
        name: 'newValue'
        nested: {
          param: {
            name: 'newNestedName'
          }
        }
        arr: [ [3], 4 ]
        oddState: 'oddValue'
      }
    ]

    assert.deepEqual @storage.getCombined(@moldPath, @defaultAction), [
      {
        name: 'newValue'
        nested: {
          param: {
            name: 'newNestedName'
          }
        }
        arr: [ [3], 4, 3 ]
        odd: 'oddValue'
        oddState: 'oddValue'
      }
    ]




  ############3 TODO: review

  it 'destroy', ->
    handlerChange = sinon.spy()
    handlerAnyChange = sinon.spy()
    @storage.$init({})
    @storage.initState(@moldPath, @defaultAction, {})
    @storage.onChangeAction(@moldPath, @defaultAction, handlerChange)
    @storage.onAnyChangeAction(@moldPath, @defaultAction, handlerAnyChange)

    @storage.updateStateLayer(@moldPath, @defaultAction, { data: 1 })

    assert.deepEqual(@storage._storage.items[@moldPath][@defaultAction], {
      state: { data: 1 }
      combined: { data: 1 }
    })

    @storage.destroy(@moldPath, @defaultAction)
    # the action's storage has to be clear
    assert.isUndefined(@storage._storage.items[@moldPath][@defaultAction])
    # after that assigned events have to be not rose
    @storage.updateStateLayer(@moldPath, @defaultAction, { data: 2 })

    # TODO: выяснить почему дваждый вызывается
    #sinon.assert.calledOnce(handlerChange)
    #sinon.assert.calledOnce(handlerAnyChange)


    it 'meta', ->
      anyHandler = sinon.spy()
      @events.on("#{@moldPath}-#{@defaultAction}|any", anyHandler)

      metaData = {
        param1: 'value1'
      }

      @storage.$init({})
      @storage.updateMeta(@moldPath, @defaultAction, metaData)

      expect(@storage.getMeta(@moldPath, @defaultAction)).to.be.deep.equal(metaData)
      expect(@storage.getMeta(@moldPath, @defaultAction, 'param1')).to.be.deep.equal('value1')
      expect(anyHandler).to.be.calledOnce
