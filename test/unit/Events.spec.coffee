Events = require('../../src/Events').default


describe.only 'Unit. Events.', ->
  beforeEach () ->
    @events = new Events()
    @handler = sinon.spy()

  it "full cycle", ->
    @events.on()
