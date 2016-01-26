rewire = require('rewire')

describe 'nodeInstance', ->
  beforeEach ->
    this.reset = () ->
      this.fakeVars = {
        log: {
          error: sinon.spy()
        },
        schema: {},
        composition: {}
      }
      this.mock = window.getMock(rewire('nodeInstance.js'), this.fakeVars).getInstance()

  describe 'getSchema', ->
    beforeEach ->
      this.reset()
      this.fakeVars.schema.getSchema = sinon.spy()

    it 'instance path is root | path=existent >> return schema of given path', ->



    it 'instance path is "deeperPath" | path=existent >> return schema of given path', ->


    it 'path=""|undefined >> return self schema', ->
      this.mock.getSchema()
      #assert.ok(this.fakeVars.schema.getSchema.calledWith(''))
      #assert.notOk(this.fakeVars.log.error.called)

    it 'path=nonexistent >> error, return undefined', ->
      this.mock.getSchema('nonexistent');
      assert(this.fakeVars.log.error.called)



    # TODO: правильно ли скомбинировался fullPath - который подставился в schema.getSchema



#  getSchema (path) {
#    let fullPath = this._combinePath(path);
#    if (!this._checkSchema(fullPath)) return;
#    return schema.getSchema(fullPath);
#  }














############################################################

mold = require('index.js')

describe 'nodeInstance', ->
  describe 'run from mold', ->
    it 'get instance and get instance of instance', ->
      item = mold.get('myScope')
      assert.equal(item.getRoot(), 'myScope')
      item2 = item.get('childScope')
      assert.equal(item2.getRoot(), 'myScope.childScope')

    it 'get instance and create schema', ->
      # TODO:

  describe 'run methods: getSchema, composition and set without having schema - it must be error', ->
    beforeEach ->
      this.nodeLogMock = {
        error: null
      }
      this.nodeMock = rewire('nodeInstance.js');
      this.nodeMock.__set__('log', this.nodeLogMock);
      this.nodeMockInstance = this.nodeMock.getInstance();

    it 'getSchema', ->
      this.nodeLogMock.error = sinon.spy()
      assert.isUndefined(this.nodeMockInstance.getSchema())
      assert(this.nodeLogMock.error.called)


  #  it 'schema', ->
  #    this.nodeLogMock.error = sinon.spy()
  #    assert.isUndefined(this.nodeMockInstance.schema(mold.number(5)))
  #    assert(this.nodeLogMock.error.called)

#    it 'composition', ->
#      this.nodeLogMock.error = sinon.spy()
#      assert.isUndefined(this.nodeMockInstance.composition())
#      assert(this.nodeLogMock.error.called)

#    it 'set', ->
#      this.nodeLogMock.error = sinon.spy()
#      assert.isUndefined(this.nodeMockInstance.set())
#      assert(this.nodeLogMock.error.called)

  describe 'Check methods', ->
    beforeEach ->
      this.nodeSchemaMock = {}
      this.nodeCompositonMock = {}
      this.nodeMock = rewire('nodeInstance.js');
      this.nodeMock.__set__('schema', this.nodeSchemaMock);
      this.nodeMock.__set__('composition', this.nodeCompositonMock);
      this.nodeMockInstance = this.nodeMock.getInstance();
#      mold.schema('myScope', mold.number(5))
#      this.instance = mold.get('myScope')

    it 'getRoot', ->
      #assert.equal(this.instance.getRoot(), 'myScope')

    it 'getSchema', ->
      #assert.deepEqual(this.instance.getSchema(), {type: 'number', value: 5})
      #this.nodeMockInstance.getSchema()

#      let fullPath = this._combinePath(path);
#      if (!this._checkSchema(fullPath)) return;
#      return schema.getSchema(fullPath);

    it 'schema', ->


    it 'composition', ->
      # TODO: do it

    it 'get', ->
#      instance2 = this.instance.get('childScope')
#      assert.equal(instance2.getRoot(), 'myScope.childScope')

    it 'set', ->
      # TODO: do it
