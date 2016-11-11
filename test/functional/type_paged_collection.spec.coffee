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
    this.pagedCollection = this.mold.child('pagedCollection')
    this.newItem = {name: 'newValue'}

  it 'init value', ->
    assert.deepEqual(this.pagedCollection.mold, [])

  # TODO: test push, unshift
  # TODO: test rearrange
  # TODO: removePage

#  describe 'addItem()', ->
#    it 'add to an empty collection', ->
#      this.pagedCollection.addItem(this.newItem)
#
#      assert.deepEqual(this.pagedCollection.mold, [[
#        {
#          $pageIndex: 0,
#          $index: 0,
#          name: 'newValue',
#        }
#      ]])
#
#    it 'add to almost full page', ->
#      page = [{name: 'newValue1'}]
#      this.pagedCollection.perPage = 2
#      this.pagedCollection.setPage(page)
#      this.pagedCollection.addItem(this.newItem)
#
#      assert.deepEqual(this.pagedCollection.mold, [
#        [
#          {
#            $pageIndex: 0,
#            $index: 0,
#            name: 'newValue1',
#          },
#          {
#            $pageIndex: 0,
#            $index: 1,
#            name: 'newValue',
#          },
#        ]
#      ])
#
#    it 'add to full page and page unordered', ->
#      page = [{name: 'newValue1'}, {name: 'newValue2'}]
#      this.pagedCollection.perPage = 2
#      this.pagedCollection.setPage(page, 2)
#      this.pagedCollection.addItem(this.newItem)
#
#      result = []
#      result[2] = [
#        {
#          $pageIndex: 2,
#          $index: 0,
#          name: 'newValue1',
#        },
#        {
#          $pageIndex: 2,
#          $index: 1,
#          name: 'newValue2',
#        },
#      ]
#      result[3] = [
#        {
#          $pageIndex: 3,
#          $index: 0,
#          name: 'newValue',
#        },
#      ]
#      assert.deepEqual(this.pagedCollection.mold, result)

  describe 'setPage()', ->
    it 'common', ->
      page = [{name: 'newValue'}]
      this.pagedCollection.setPage(page, 0)
      assert.deepEqual(this.pagedCollection.mold, [[
        {
          $pageIndex: 0,
          $index: 0,
          name: 'newValue',
        }
      ]])

    it 'unordered', ->
      page = [{name: 'newValue'}]
      this.pagedCollection.setPage(page, 2)
      result = []
      result[2] = [
        {
          $pageIndex: 2,
          $index: 0,
          name: 'newValue',
        }
      ]
      assert.deepEqual(this.pagedCollection.mold, result)

  describe 'getFlat()', ->
    it 'unordered', ->
      page1 = [{name: 'newValue1'}, {name: 'newValue2'}]
      page2 = [{name: 'newValue3'}, {name: 'newValue4'}]
      this.pagedCollection.setPage(page1, 2)
      this.pagedCollection.setPage(page2, 5)
      assert.deepEqual(this.pagedCollection.getFlat(), [
        {
          name: 'newValue1',
        },
        {
          name: 'newValue2',
        },
        {
          name: 'newValue3',
        },
        {
          name: 'newValue4',
        }
      ])

  describe 'child(pageNum)', ->
    it 'no one pages', ->
      assert.isUndefined(this.pagedCollection.child(0))
      assert.isUndefined(this.pagedCollection.child(1))

    it 'returned page is a collection', ->
      page = [{name: 'newValue1'}, {name: 'newValue2'}]
      this.pagedCollection.setPage([], 0)
      this.pagedCollection.setPage(page)
      child = this.pagedCollection.child(1)

      assert.equal(child.type, 'collection')
      assert.deepEqual(child.mold, [
        {
          $pageIndex: 1,
          $index: 0,
          name: 'newValue1',
        },
        {
          $pageIndex: 1,
          $index: 1,
          name: 'newValue2',
        },
      ])

  describe 'removePage(pageNum)', ->
    it 'common', ->
    #TODO: !!!! do it!

  describe 'batchAdd(items)', ->
    it 'common', ->
      #TODO: !!!! do it!

  describe 'batchRemove(items)', ->
    it 'common', ->
    #TODO: !!!! do it!
