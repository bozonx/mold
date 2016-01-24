mold = require('index.js')
schema = require('schema/schema.js')
rewire = require('rewire')

# TODO: test composition after set schema

describe 'schema', ->
  beforeEach ->
    this.schemaLogMock = {
      error: null
    }
    this.schemaMock = rewire('schema/schema.js');
    this.schemaMock.__set__('log', this.schemaLogMock);

  describe 'get/set schema', ->
    it 'another require of mold must return same value of first require', ->
      mold.schema('param1', mold.number(5));
      anotherMold = require('index.js')
      assert.deepEqual(anotherMold.getSchema('param1'), {type: 'number', value: 5})

    # TODO: test schema validation

    it 'get/set full schema', ->
      mold.$$reset()
      mold.schema('/', mold.number(5));
      assert.deepEqual(mold.getSchema(), {type: 'number', value: 5})

    it 'get/set schema by path', ->
      mold.schema('testParam', mold.number(5));
      assert.deepEqual(mold.getSchema('testParam'), {type: 'number', value: 5})

  describe 'getSchema', ->
    it 'get not existent param', ->
      assert.isUndefined(mold.getSchema('notExistent'))

    it 'wrong argument', ->
      this.schemaLogMock.error = sinon.spy()

      this.schemaMock.getSchema(null)
      assert(this.schemaLogMock.error.called)

    it 'must return clone', ->
      mold.schema('unchangedParam', mold.number(7));
      clonedAll = mold.getSchema()
      clonedPart = mold.getSchema('unchangedParam')

      schema._schema.unchangedParam.value = 8
      assert.equal(clonedAll.unchangedParam.value, 7)
      assert.equal(clonedPart.value, 7)


  describe 'setSchema', ->
    it 'wrong "path" parameter', ->
      this.schemaLogMock.error = sinon.spy()

      this.schemaMock.setSchema(null, null)
      assert(this.schemaLogMock.error.called)

    it 'error if parent path not exist', ->
      this.schemaLogMock.error = sinon.spy()

      this.schemaMock.setSchema('ppp.ppp.ppp.ppp', mold.number(5));
      assert(this.schemaLogMock.error.called)


  describe 'full struct and basic values', ->
    beforeEach ->
      this.schema = mold.struct {
        numberValue: mold.number(5),
        booleanValueTrue: mold.boolean(true),
        booleanValueFalse: mold.boolean(false),
        stringValue: mold.string('str value'),
        innerStruct: mold.struct {
          innerStructNumber: mold.number(7)
        }
      }

    it 'root/first', ->
      mold.schema('first', this.schema)
      assert.deepEqual mold.getSchema('first'), {
        type: 'struct'
        children: {
          numberValue: {type: 'number', value: 5}
          booleanValueTrue: {type: 'boolean', value: true}
          booleanValueFalse: {type: 'boolean', value: false}
          stringValue: {type: 'string', value: 'str value'}
          innerStruct: {
            type: 'struct'
            children: {
              innerStructNumber: {
                type: 'number'
                value: 7
              }
            }
          }
        }
      }

    it 'first.numberValue', ->
      mold.schema('first', this.schema)
      assert.deepEqual(mold.getSchema('first.numberValue'), {type: 'number', value: 5})


