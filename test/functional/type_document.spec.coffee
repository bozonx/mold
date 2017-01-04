mold = require('../../src/index').default

describe 'Functional. Document type.', ->
  beforeEach () ->
    testSchema = () ->
      document:
        type: 'document'
        schema:
          boolParam: { type: 'boolean' }
          stringParam: { type: 'string'}
          numberParam: { type: 'number' }
          arrayParam: { type: 'array' }
          nested:
            type: 'container'
            schema:
              nestedStringParam:
                type: 'string'

    this.testValues = {
      boolParam: true,
      stringParam: 'newValue',
      numberParam: 5,
      arrayParam: ['value1'],
      nested:
        nestedStringParam: 'nestedValue'
    }

    this.testSchema = testSchema()
    this.mold = mold( {silent: true}, this.testSchema )
    this.document = this.mold.child('document')

  it 'load() and check mold', (done) ->
    _.set(this.mold.$$schemaManager.$defaultMemoryDb, 'document', this.testValues)

    expect(this.document.load()).to.eventually.notify =>
      expect(Promise.resolve(this.document.mold)).to.eventually
      .deep.equal(this.testValues)
      .notify(done)

  it 'load() and check response', ->
    _.set(this.mold.$$schemaManager.$defaultMemoryDb, 'document', this.testValues)

    expect(this.document.load()).to.eventually.property('body').deep.equal(this.testValues)

  it 'update() and put()', ->
    this.document.update(this.testValues)
    expect(this.document.put()).to.eventually
    .property('body').deep.equal(this.testValues)

  it "put(newState)", ->
    expect(this.document.put(this.testValues)).to.eventually
    .property('body').deep.equal(this.testValues)
