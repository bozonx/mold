mold = require('../../src/index').default

describe 'Functional. Container type.', ->
  beforeEach () ->
    testSchema = () ->
      root:
        type: 'container'
        schema:
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
            type: 'container'
            schema:
              nestedStringParam:
                type: 'string'

      this.testSchema = testSchema()
      this.mold = mold( {}, this.testSchema )
      this.root = this.mold.instance('root')



  # TODO: check initial values, setMold, getMold, child

  describe 'child(subpath)', ->


#    it 'child: container', () ->
#      #this.container = this.rootInstance.child('inMemory')
#
#      containerDeeper = this.container.child('nested')
#      assert.equal(containerDeeper.getRoot(), 'memoryBranch.inMemory.nested')
#      assert.deepEqual(containerDeeper.schema, this.testSchema.memoryBranch.schema.inMemory.schema.nested)

#    it 'child: primitive', () ->
#      primitiveInstance = this.container.child('stringParam')
#      assert.equal(primitiveInstance.getRoot(), 'memoryBranch.inMemory.stringParam')
#      assert.deepEqual(primitiveInstance.schema, this.testSchema.memoryBranch.inMemory.stringParam)

#    it 'child: array', () ->
#      arrayInstance = this.container.child('arrayParam')
#      assert.equal(arrayInstance.getRoot(), 'memoryBranch.inMemory.arrayParam')
#      assert.deepEqual(arrayInstance.schema, this.testSchema.memoryBranch.inMemory.arrayParam)
