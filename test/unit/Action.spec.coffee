Action = require('../../src/Action')
Storage = require('../../src/Storage')


describe.only 'Unit. Action.', ->
  beforeEach () ->
    @main = {
      storage: new Storage({})
      request: {
        sendRequest: sinon.stub().returns(Promise.resolve())
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

  it "request - check params processing", ->
    assert.isFalse(@action.pending)

    promise = @action.request({
      url: { id: 5 }
      body: { payloadParam: 'value' }
      requestDriverParam: 'value '
    })

    assert.isTrue(@action.pending)
    assert.equal(@action._getMeta('lastError'), null)
    assert.deepEqual(@action._getMeta('urlParams'), { rootId: 1, id: 5 })
    assert.deepEqual(@action._getMeta('driverParams'), {
      method: 'get'
      schemaDriverParam: 'value'
      defaultDriverParam: 'value'
      requestDriverParam: 'value '
    })

    # TODO: test promise result
    # TODO: test promise reject
