Action = require('../../src/Action')
Storage = require('../../src/Storage')


describe.only 'Unit. Action.', ->
  beforeEach () ->
    @main = {
      storage: new Storage({})
      request: {
        sendRequest: sinon.stub().returns(Promise.resolve({}))
      }
    }
    @nodeInstance = {}

    @main.storage.$init()
    @main.storage.initAction('path/to/doc', 'myAction', {})
    @primitiveSchema = {}
    @actionParams = {
      url: '/path/${rootId}/to/${id}/'
      method: 'get',
      schemaDriverParam: 'value'
      transform: undefined
      request: undefined
    }

    @action = new Action(
      @main,
      @nodeInstance,
      'path/to/doc',
      'myAction',
      @primitiveSchema,
      @actionParams,
      { rootId: 1 },
      { defaultDriverParam: 'value' }
    )
    @action.init()

  it "request - params processing", ->
    lastRequestParams = {
      urlParams: {
        rootId: 1,
        id: 5
      }
      driverParams: {
        method: 'get'
        schemaDriverParam: 'value'
        defaultDriverParam: 'value'
        requestDriverParam: 'value'
      }
      payload: {
        payloadParam: 'value'
      }
    }

    assert.isFalse(@action.pending)

    @action.request({
      url: { id: 5 }
      body: { payloadParam: 'value' }
      requestDriverParam: 'value'
    })

    assert.isTrue(@action.pending)
    assert.equal(@action._getMeta('lastError'), null)
    assert.deepEqual(@action._getMeta('lastRequestParams'), lastRequestParams)
    sinon.assert.calledWith(@main.request.sendRequest, lastRequestParams)

  it "request - check response", ->
    @main.request.sendRequest = ->
      Promise.resolve {
        body: {
          respParam: 'value'
        }
      }

    @action.request({})
      .then (resp) ->
        assert.deepEqual(resp, {
          body: {
            respParam: 'value'
          }
        })

  it "request - transform response", ->
    @actionParams.transform = (resp) ->
      {
        resp...
        additionalParam: 'value'
      }

    @main.request.sendRequest = ->
      Promise.resolve {
        body: {
          respParam: 'value'
        }
      }

    @action.request({})
      .then (resp) ->
        assert.deepEqual(resp, {
          body: {
            respParam: 'value'
          }
          additionalParam: 'value'
        })


    # TODO: test request replacement
    # TODO: test promise reject
    # TODO: test unsaveable
    # TODO: test event after pending is completed
