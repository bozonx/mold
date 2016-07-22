mold = require('../../src/index')

describe 'Functional. Container type.', ->
  describe 'child(subpath)', ->
    beforeEach () ->
      testSchema = () ->
        memoryBranch:
          inMemory:
            boolParam:
              type: 'boolean'
              default: false
            stringParam:
              type: 'string'
              default: 'defaultStringValue'
            numberParam:
              type: 'number'
              default: 5
            arrayParam:
              type: 'array'
            nested:
              nestedStringParam:
                type: 'string'

      this.testSchema = testSchema()
      this.mold = mold.initSchema( {}, this.testSchema )
      this.rootInstance = this.mold.instance('memoryBranch')
      this.container = this.rootInstance.child('inMemory')

    it 'child: container', () ->
      containerDeeper = this.container.child('nested')
      assert.equal(containerDeeper.getRoot(), 'memoryBranch.inMemory.nested')
      assert.deepEqual(containerDeeper.schema, this.testSchema.memoryBranch.inMemory.nested)

    it 'child: primitive', () ->
      primitiveInstance = this.container.child('stringParam')
      assert.equal(primitiveInstance.getRoot(), 'memoryBranch.inMemory.stringParam')
      assert.deepEqual(primitiveInstance.schema, this.testSchema.memoryBranch.inMemory.stringParam)

    it 'child: array', () ->
      arrayInstance = this.container.child('arrayParam')
      assert.equal(arrayInstance.getRoot(), 'memoryBranch.inMemory.arrayParam')
      assert.deepEqual(arrayInstance.schema, this.testSchema.memoryBranch.inMemory.arrayParam)

  describe 'get() and get(subpath)', ->
    beforeEach () ->
      testSchema = () ->
        inMemory:
          boolParam:
            type: 'boolean'
          stringParam:
            type: 'string'
          numberParam:
            type: 'number'
          arrayParam:
            type: 'array'

      this.testSchema = testSchema()
      this.mold = mold.initSchema( {}, this.testSchema )
      this.container = this.mold.instance('inMemory')

      this.containerValues = {
        boolParam: true,
        stringParam: 'new value',
        numberParam: 5,
        arrayParam: ['value1'],
      }
    # TODO: get bool and num
    # TODO: test initial values

    it 'get() and check mold', (done) ->
      _.set(this.mold.schemaManager.$defaultMemoryDb, 'inMemory', this.containerValues)
      expect(this.container.get()).to.eventually.notify =>
        expect(Promise.resolve(this.container.mold)).to.eventually
        .deep.equal(this.containerValues)
        .notify(done)

    it 'get() and check response', ->
      _.set(this.mold.schemaManager.$defaultMemoryDb, 'inMemory', this.containerValues)
      expect(this.container.get()).to.eventually.property('coocked').deep.equal(this.containerValues)

    it 'get(subpath) and check mold', (done) ->
      _.set(this.mold.schemaManager.$defaultMemoryDb, 'inMemory.stringParam', 'new value')
      expect(this.container.get('stringParam')).to.eventually.notify =>
        expect(Promise.resolve(this.container.mold.stringParam)).to.eventually
        .equal('new value')
        .notify(done)

    it 'get(subpath) and check response', ->
      _.set(this.mold.schemaManager.$defaultMemoryDb, 'inMemory.stringParam', 'new value')
      expect(this.container.get('stringParam')).to.eventually.property('coocked').equal('new value')


  describe 'setMold and save', ->
    beforeEach ->
      this.testSchema =
        memoryBranch:
          simpleContainer:
            numberParam:
              type: 'number'
            stringParam:
              type: 'string'
          nestedContainer:
            stringParam:
              type: 'string'
            nested:
              nestedStringParam:
                type: 'string'

      this.mold = mold.initSchema( {}, this.testSchema )
      this.rootInstance = this.mold.instance('memoryBranch')
      this.simpleContainer = this.rootInstance.child('simpleContainer')
      this.nestedContainer = this.rootInstance.child('nestedContainer')

    it 'to root', ->
      this.simpleContainer.setMold({stringParam: 'new value'})
      assert.deepEqual(this.simpleContainer.mold, {
        stringParam: 'new value'
        numberParam: null
      })
      expect(this.simpleContainer.save()).to.eventually
      .property('coocked').deep.equal({
        stringParam: 'new value'
        numberParam: null
      })

    it 'to child', ->
      this.simpleContainer.setMold('stringParam', 'new value')
      assert.deepEqual(this.simpleContainer.mold, {
        stringParam: 'new value'
        numberParam: null
      })
      expect(this.simpleContainer.save('stringParam')).to.eventually
      .property('coocked').equal('new value')

    it 'to nested container', ->
      this.nestedContainer.setMold('nested', {nestedStringParam: 'new value'})
      assert.deepEqual(this.nestedContainer.mold, {
        stringParam: null
        nested: {
          nestedStringParam: 'new value'
        }
      })
      expect(this.nestedContainer.save('nested')).to.eventually
      .property('coocked').deep.equal({
        nestedStringParam: 'new value'
      })

    it 'to nested container child', ->
      this.nestedContainer.setMold('nested.nestedStringParam', 'new value')
      assert.deepEqual(this.nestedContainer.mold, {
        stringParam: null
        nested: {
          nestedStringParam: 'new value'
        }
      })
      expect(this.nestedContainer.save('nested.nestedStringParam')).to.eventually
      .property('coocked').deep.equal('new value')
