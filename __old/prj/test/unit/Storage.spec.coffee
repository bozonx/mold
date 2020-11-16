Storage = require('../../src/Storage')


describe 'Unit. Storage.', ->
  beforeEach ->
    @defaultAction = 'default'
    @log = {
      fatal: (err) => throw new Error(err)
    }
    @storage = new Storage(@log)
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
    @storage.initAction(@moldPath, @defaultAction, [])
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


  it "updateMeta", ->
    handlerAnyChange = sinon.spy()
    @storage.$init()
    @storage.initAction(@moldPath, @defaultAction, {})
    @storage.onAnyChangeAction(@moldPath, @defaultAction, handlerAnyChange)

    @storage.updateMeta @moldPath, @defaultAction, {
      name: 'newValue'
      nested: {
        param: {
          name: 'nestedName'
        }
      }
      arr: [ [1], 2 ]
    }

    @storage.updateMeta @moldPath, @defaultAction, {
      nested: {
        param: {
          name2: 'newNestedName2'
        }
      }
      arr: [ [3] ]
    }

    assert.deepEqual @storage.getMeta(@moldPath, @defaultAction), {
      name: 'newValue'
      nested: {
        param: {
          name2: 'newNestedName2'
        }
      }
      arr: [ [3] ]
    }

    sinon.assert.calledTwice(handlerAnyChange);


  it 'destroy', ->
    @storage.$init()
    @storage.initAction(@moldPath, @defaultAction, {})
    @storage.onChangeAction(@moldPath, @defaultAction, sinon.spy())
    @storage.onAnyChangeAction(@moldPath, @defaultAction, sinon.spy())
    changeEventName = @storage._getEventName( @storage._getFullPath(@moldPath, @defaultAction) , 'change')
    anyEventName = @storage._getEventName( @storage._getFullPath(@moldPath, @defaultAction) , 'any')

    assert.equal(@storage._events.getListeners(changeEventName).length, 1)
    assert.equal(@storage._events.getListeners(anyEventName).length, 1)

    @storage.updateStateLayer(@moldPath, @defaultAction, { data: 1 })

    assert.deepEqual(@storage.getState(@moldPath, @defaultAction), { data: 1 })

    @storage.destroy(@moldPath, @defaultAction)

    # the action's storage has to be clear
    assert.isNull(@storage._storage.items[@moldPath][@defaultAction])
    # you can't set data to action if it hasn't inited after destroy
    assert.throws(() => @storage.updateStateLayer(@moldPath, @defaultAction, { data: 2 }))
    # event handlers has to be clear
    assert.equal(@storage._events.getListeners(changeEventName).length, 0)
    assert.equal(@storage._events.getListeners(anyEventName).length, 0)


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
