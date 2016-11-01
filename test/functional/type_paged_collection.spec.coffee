mold = require('../../src/index').default

testSchema = () ->
  pagedCollection:
    type: 'pagedCollection'
    item:
      type: 'collection'
      item:
        type: 'container'
        schema:
          id: {type: 'number', primary: true}
          name: {type: 'string'}

describe 'Functional. Paged Collection type.', ->
  beforeEach () ->
    this.mold = mold( {}, testSchema() )
    this.pagedCollection = this.mold.instance('pagedCollection')
    this.newItem = {name: 'newName'}

  it 'init value', ->
    assert.deepEqual(this.pagedCollection.mold, [])

  describe 'addItem()', ->
#    it 'add to empty collection', ->
#      this.pagedCollection.addItem(this.newItem)
#      assert.deepEqual(this.pagedCollection.mold, [[this.newItem]])

    # TODO: проверить чтобы не было переполнения страницы - при полной странице добавляется в новую
    # TODO: проверить что добавляется в конец
