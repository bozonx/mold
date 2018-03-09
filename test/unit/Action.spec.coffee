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

    @action = new Action(
      @main,
      @nodeInstance,
      'path/to/doc',
      'myAction',
      @primitiveSchema,
      {
        url: '/path/${rootId}/to/${id}/'
        method: 'get',
        schemaDriverParam: 'value'
        #transform: () ->
        #request: () ->
      },
      { rootId: 1 },
      { defaultDriverParam: 'value' }
    )
    @action.init()

  it "request - params processing", ->
    assert.isFalse(@action.pending)

    @action._updateMeta({
      urlParams: {
        urlParamFromMeta: 'value'
      }
      driverParams: {
        driverParamsFromMeta: 'value'
      }
    })

    @action.request({
      url: { id: 5 }
      body: { payloadParam: 'value' }
      requestDriverParam: 'value '
    })

    assert.isTrue(@action.pending)
    assert.equal(@action._getMeta('lastError'), null)
    assert.deepEqual(@action._getMeta('urlParams'), {
      rootId: 1,
      urlParamFromMeta: 'value'
      id: 5
    })
    assert.deepEqual(@action._getMeta('driverParams'), {
      method: 'get'
      schemaDriverParam: 'value'
      defaultDriverParam: 'value'
      driverParamsFromMeta: 'value'
      requestDriverParam: 'value '
    })

  it "request - check response", ->
    promise = @action.request({
      url: { id: 5 }
      body: { payloadParam: 'value' }
      requestDriverParam: 'value '
    })

    # TODO: test transromr
    # TODO: test request replacement
    # TODO: test promise reject
