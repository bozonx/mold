mold = require('../../src/index').default

describe 'Functional. Action.', ->
  beforeEach () ->
    this.handlerLoad = sinon.spy();
    handlerLoad = this.handlerLoad;
    this.handlerCustomAction = sinon.spy();
    handlerCustomAction = this.handlerCustomAction;

    testSchema = () ->
      documentsCollection:
        type: 'documentsCollection'
        action: {
          load: (v) => handlerLoad(v),
          customAction: (v) -> handlerCustomAction(v),
        }
        actionDefaults: {
          load: {
            options: {
              param1: 'value1',
            }
          }
        }
        item:
          type: 'document'
          action: {
            load: (v) => handlerLoad(v),
            customAction: (v) -> handlerCustomAction(v),
          }
          schema:
            $id: {type: 'number', primary: true}

    this.testSchema = testSchema()
    this.mold = mold( {silent: true}, this.testSchema )
    this.documentsCollection = this.mold.child('documentsCollection')
    this.document = this.mold.child('documentsCollection[0]')

  describe "DocumentsCollection", ->
    it "custom action", ->
      this.documentsCollection.action.customAction('param');

      expect(this.handlerCustomAction).to.have.been.calledOnce
      expect(this.handlerCustomAction).to.have.been.calledWith('param')

    it "Overwrote load", ->
      this.documentsCollection.load(1);

      expect(this.handlerLoad).to.have.been.calledOnce
      expect(this.handlerLoad).to.have.been.calledWith(1)

  describe "Document", ->
    it "custom action", ->
      this.document.action.customAction('param');

      expect(this.handlerCustomAction).to.have.been.calledOnce
      expect(this.handlerCustomAction).to.have.been.calledWith('param')

    it "Overwrote load", ->
      this.document.load(1);

      expect(this.handlerLoad).to.have.been.calledOnce
      expect(this.handlerLoad).to.have.been.calledWith(1)

# TODO: load with defaults
# TODO: сделать custom action с запуском load внутри и возвращает промис
