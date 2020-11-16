Events = require('../../src/StorageEvents')


describe 'Unit. StorageEvents.', ->
  beforeEach () ->
    @events = new Events()
    @handler1 = sinon.spy()
    @handler2 = sinon.spy()

  it "on and off", ->
    @events.on('path-to-change', @handler1)
    @events.on('path-to-change', @handler2)

    @events.off('path-to-change', @handler2)

    @events.emit('path-to-change')

    sinon.assert.calledOnce(@handler1)
    sinon.assert.notCalled(@handler2)

  it "destroy", ->
    @events.on('path-to-change', @handler1)
    @events.on('other-path-to-change', @handler2)

    @events.destroy('path-to')

    @events.emit('path-to-change')
    @events.emit('other-path-to-change')

    sinon.assert.notCalled(@handler1)
    sinon.assert.calledOnce(@handler2)
