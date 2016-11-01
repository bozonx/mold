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
    this.newItem = {name: 'newValue'}

  it 'init value', ->
    assert.deepEqual(this.pagedCollection.mold, [])

  describe 'addItem()', ->
    it 'add to empty collection', ->
      this.pagedCollection.addItem(this.newItem)
      assert.deepEqual(this.pagedCollection.mold, [[
        {
          $index: 0,
          $isNew: true,
          name: 'newValue',
        }
      ]])

    # TODO: проверить чтобы не было переполнения страницы - при полной странице добавляется в новую
    # TODO: проверить что добавляется в конец
    # TODO: тестировать страницы не по порядку


  describe 'addPage()', ->
    it 'common', ->
      page = [{name: 'newValue'}]
      this.pagedCollection.addPage(page)
      assert.deepEqual(this.pagedCollection.mold, [[
        {
          # TODO: должен быть $index
          #$index: 0,
          $isNew: true,
          name: 'newValue',
        }
      ]])

    # TODO: тестировать добаление страницы не попорядку

  describe 'getFlat()', ->
    it 'common', ->
      page1 = [{name: 'newValue1'}, {name: 'newValue2'}]
      page2 = [{name: 'newValue3'}, {name: 'newValue4'}]
      this.pagedCollection.addPage(page1)
      this.pagedCollection.addPage(page2)
      assert.deepEqual(this.pagedCollection.getFlat(), [
        {
          # TODO: должен быть $index
          $isNew: true,
          name: 'newValue1',
        },
        {
          $isNew: true,
          name: 'newValue2',
        },
        {
          $isNew: true,
          name: 'newValue3',
        },
        {
          $isNew: true,
          name: 'newValue4',
        }
      ])
    # TODO: тестировать добаление страницы не попорядку
