mold = require('../../src/index')

describe 'Functional. Container type.', ->
  describe 'common usage', ->
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
              item: {
                id: {type: 'number'}
                name: {type: 'string'}
              }
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

    it 'Set to child and check child mold', (done) ->
      expect(this.container.set('stringParam', 'new value')).to.eventually.notify =>
        expect(Promise.resolve(this.container.child('stringParam').mold)).to.eventually.equal('new value').notify(done)

    # TODO: вернуть
#    it 'set({...}) and get("")', (done) ->
#      expect(this.container.set({stringParam: 'new value'})).to.eventually.notify =>
#        expect(this.container.get('')).to.eventually.property('coocked').deep.equal({stringParam: 'new value'}).notify(done)

    it 'get(subpath)', (done) ->
      expect(this.container.set('stringParam', 'new value')).to.eventually.notify =>
        expect(this.container.get('stringParam')).to.eventually.property('coocked').equal('new value').notify(done)

    it 'set(subpath, newValue): Set to primitive via container', (done) ->
      expect(this.container.set('stringParam', 'new value')).to.eventually.notify =>
        expect(Promise.resolve(this.container.mold.stringParam)).to.eventually.equal('new value').notify(done)

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
      .property('coocked').deep.equal({
        stringParam: 'new value'
        numberParam: null
      })

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
      .property('coocked').deep.equal({
        nestedStringParam: 'new value'
      })
