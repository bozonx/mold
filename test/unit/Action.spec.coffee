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

  describe 'request.', ->
    it "params processing", ->
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

    it "check response", ->
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

    it "transform response", ->
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

    it "replace request - returns promise", ->
      @actionParams.request = (params) ->
        newParams = {
          params...
          urlParams: {
            params.urlParams...
            additionalParam: 'value'
          }
        }

        return Promise.resolve(newParams)

      @action.request({ url: { id: 5 } })
        .then =>
          sinon.assert.calledWith @main.request.sendRequest, {
            urlParams: {
              rootId: 1
              id: 5
              additionalParam: 'value'
            }
            driverParams: {
              defaultDriverParam: "value",
              method: "get",
              schemaDriverParam: "value"
            },
            payload: undefined
          }

    it "replace request - returns object", ->
      @actionParams.request = (params) ->
        {
          params...
          urlParams: {
            params.urlParams...
            additionalParam: 'value'
          }
        }

      @action.request({ url: { id: 5 } })
      sinon.assert.calledWith @main.request.sendRequest, {
        urlParams: {
          rootId: 1
          id: 5
          additionalParam: 'value'
        }
        driverParams: {
          defaultDriverParam: "value",
          method: "get",
          schemaDriverParam: "value"
        },
        payload: undefined
      }

    it "replace request - returns undefined", ->
      @actionParams.request = (params) ->

      @action.request({ url: { id: 5 } })
      sinon.assert.calledWith @main.request.sendRequest, {
        urlParams: {
          rootId: 1
          id: 5
        }
        driverParams: {
          defaultDriverParam: "value",
          method: "get",
          schemaDriverParam: "value"
        },
        payload: undefined
      }

      # TODO: test promise reject - and with request replacement
      # TODO: test event after pending is completed
