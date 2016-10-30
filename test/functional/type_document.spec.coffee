mold = require('../../src/index').default

describe 'Functional. Document type.', ->
  beforeEach () ->
    testSchema = () ->
      root:
        type: 'container',
        driver: 'memory',
        schema:
          articleDetails:
            type: 'document',
            schema:
              stringParam: { type: 'string' }
              nested:
                type: 'container',
                schema:
                  nestedParam: { type: 'string' }

    # get by path -   root.articleDetails.stringParam.nested.stringParam
    # get in schema - root.schema.articleDetails.schema.nested.schema.stringParam

#    this.testSchema = testSchema()
#    this.mold = mold( {}, this.testSchema )
#    this.rootInstance = this.mold.instance('memoryBranch')
#    this.container = this.rootInstance.child('inMemory')

  it '', () ->
