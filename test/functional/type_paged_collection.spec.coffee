mold = require('../../src/index').default

testSchema = () ->
  pagedCollection:
    type: 'pagedCollection'
    item:
      collection:
        type: 'collection'
        item:
          num:
            type: 'container'
            schema:
              id: {type: 'number', primary: true}
              name: {type: 'string'}

describe 'Functional. Paged Collection type.', ->
  beforeEach () ->
    this.mold = mold( {}, testSchema() )
    this.pagedCollection = this.mold.instance('pagedCollection')

  it 'init value', ->
    console.log(this.pagedCollection)
    assert.deepEqual(this.pagedCollection.mold, [])
