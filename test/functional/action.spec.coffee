mold = require('../../src/index').default

describe 'Functional. Action.', ->
  describe 'Action.', ->
    beforeEach () ->
      this.handlerCreate = sinon.spy();
      handlerCreate = this.handlerCreate;
      this.handlerCustomAction = sinon.spy();
      handlerCustomAction = this.handlerCustomAction;

      testSchema = () ->
        documentsCollection:
          type: 'documentsCollection'
          action: {
            load: {
              options: {
                param1: 'value1',
              }
            },
            create: (v) => handlerCreate(v),
            customAction: (v) -> handlerCustomAction(v),
          }
          item:
            type: 'document'
            action: {
              put: (v) => handlerCreate(v),
              customAction: (v) -> handlerCustomAction(v),
            }
            schema:
              $id: {type: 'number', primary: true}

      this.testSchema = testSchema()
      this.mold = mold( {silent: true}, this.testSchema )
      this.documentsCollection = this.mold.child('documentsCollection')
      this.document = this.mold.child('documentsCollection[0]')

    it "action defaults", ->
      handlerSendRequest = sinon.spy();
      savedMethod = this.documentsCollection._main.$$state.$$request.sendRequest.bind(this.documentsCollection._main.$$state.$$request)
      this.documentsCollection._main.$$state.$$request.sendRequest = (rawRequest, schema, urlParams) ->
        handlerSendRequest(rawRequest, schema, urlParams)
        return savedMethod(rawRequest, schema, urlParams)
      this.documentsCollection.load(1);

      expect(handlerSendRequest).to.have.been.calledOnce
      expect(handlerSendRequest).to.have.been.calledWith({
        method: 'filter',
        moldPath: 'documentsCollection',
        metaParams: { pageNum: 1 },
        #options: undefined ,
        options: {
          param1: 'value1',
        },
      }, this.testSchema.documentsCollection)

    describe "DocumentsCollection", ->
      it "custom action", ->
        this.documentsCollection.action.customAction('param');

        expect(this.handlerCustomAction).to.have.been.calledOnce
        expect(this.handlerCustomAction).to.have.been.calledWith('param')

      it "Overwrote create", ->
        this.documentsCollection.create(1);

        expect(this.handlerCreate).to.have.been.calledOnce
        expect(this.handlerCreate).to.have.been.calledWith(1)

    describe "Document", ->
      it "custom action", ->
        this.document.action.customAction('param');

        expect(this.handlerCustomAction).to.have.been.calledOnce
        expect(this.handlerCustomAction).to.have.been.calledWith('param')

      it "Overwrote put", ->
        this.document.put(1);

        expect(this.handlerCreate).to.have.been.calledOnce
        expect(this.handlerCreate).to.have.been.calledWith(1)




#
#  describe "driverDefaults", ->
#    beforeEach () ->
#      testSchema = () ->
#        documentsCollection:
#          type: 'documentsCollection'
#          driverDefaults: {
#            filter: {
#              options: {
#                param1: 'value1',
#              }
#            }
#          }
#
#      this.testSchema = testSchema()
#      this.mold = mold( {silent: true}, this.testSchema )
#      this.documentsCollection = this.mold.child('documentsCollection')
#
#    it "load defaults", ->
#      handlerSendRequest = sinon.spy();
#      savedMethod = this.documentsCollection._main.$$state.$$request._startDriverRequest.bind(this.documentsCollection._main.$$state.$$request)
#      this.documentsCollection._main.$$state.$$request._startDriverRequest = (rawRequest, schema, urlParams) ->
#        handlerSendRequest(rawRequest, schema, urlParams)
#        return savedMethod(rawRequest, schema, urlParams)
#      this.documentsCollection.load(1);
#
#      expect(handlerSendRequest).to.have.been.calledOnce
#      expect(handlerSendRequest).to.have.been.calledWith({
#        method: 'filter',
#        moldPath: 'documentsCollection',
#        metaParams: { pageNum: 1 },
#        #options: undefined ,
#        options: {
#          param1: 'value1',
#        },
#      }, this.testSchema.documentsCollection)
