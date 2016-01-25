mold = require('index.js')
rewire = require('rewire')

describe 'nodeInstance', ->
  describe 'run from mold', ->
    it 'get instance and get instance of instance', ->
      item = mold.get('myScope')
      assert.equal(item.getRoot(), 'myScope')
      item2 = item.get('childScope')
      assert.equal(item2.getRoot(), 'myScope.childScope')

    it 'get instance and create schema', ->
      # TODO:

  describe 'test module itself', ->
    beforeEach ->
      this.nodeLogMock = {
        error: null
      }
      this.nodeMock = rewire('nodeInstance.js');
      this.nodeMock.__set__('log', this.schemaLogMock);

    it 'run methods: getSchema, schema, composition, set without having schema - it must be error', ->
#      this.nodeLogMock.error = sinon.spy()
#      this.nodeMock.getSchema()
#      assert(this.nodeLogMock.error.called)

