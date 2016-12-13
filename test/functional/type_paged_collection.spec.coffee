mold = require('../../src/index').default

testSchema = () ->
  pagedCollection:
    type: 'pagedCollection'
    item:
      type: 'container'
      schema:
        id: {type: 'number', primary: true}
        name: {type: 'string'}

describe 'Functional. Paged Collection type.', ->
  beforeEach () ->
    this.mold = mold( {silent: true}, testSchema() )
    this.pagedCollection = this.mold.child('pagedCollection')

  it 'init value', ->
    assert.deepEqual(this.pagedCollection.mold, [])

  describe 'unshift()', ->
    it "to empty pagedCollection", ->
      this.pagedCollection.perPage = 1
      this.pagedCollection.unshift({name: 'newValue1'})
      this.pagedCollection.unshift({name: 'newValue2'})
      assert.deepEqual(this.pagedCollection.mold, [[
        {$addedUnsaved: true, $index: 0, $pageIndex: 0, name: 'newValue2'}
        {$addedUnsaved: true, $index: 1, $pageIndex: 0,name: 'newValue1'}
      ]])

  describe 'push()', ->
    it "to empty pagedCollection", ->
      this.pagedCollection.perPage = 1
      this.pagedCollection.push({name: 'newValue1'})
      this.pagedCollection.push({name: 'newValue2'})
      assert.deepEqual(this.pagedCollection.mold, [[
        {$addedUnsaved: true, $index: 0, $pageIndex: 0, name: 'newValue1'}
        {$addedUnsaved: true, $index: 1, $pageIndex: 0,name: 'newValue2'}
      ]])

    it "to empty pagedCollection", ->
      this.pagedCollection.perPage = 1
      this.pagedCollection.setPage([{name: 'newValue1'}], 0)
      this.pagedCollection.setPage([{name: 'newValue2'}], 1)
      this.pagedCollection.push({name: 'newValue3'})
      assert.deepEqual(this.pagedCollection.mold, [
        [
          {$index: 0, $pageIndex: 0, name: 'newValue1'}
        ],
        [
          {$index: 0, $pageIndex: 1, name: 'newValue2'}
          {$addedUnsaved: true, $index: 1, $pageIndex: 1, name: 'newValue3'}
        ]
      ])

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


  describe 'removePage(pageNum)', ->
    it 'remove last page', ->
      this.pagedCollection.setPage([{name: 'newValue'}], 0)
      this.pagedCollection.removePage(0)
      assert.deepEqual(this.pagedCollection.mold, [undefined])

    it 'remove first page', ->
      this.pagedCollection.setPage([{name: 'newValue0'}], 0)
      this.pagedCollection.setPage([{name: 'newValue1'}], 1)
      this.pagedCollection.removePage(0)
      assert.deepEqual(this.pagedCollection.mold, [undefined , [{
        $index: 0
        $pageIndex: 1
        name: 'newValue1'
      }]])

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

  # TODO: переделать

#  describe 'child(pageNum)', ->
#    it 'no one pages', ->
#      assert.isUndefined(this.pagedCollection.child(0))
#      assert.isUndefined(this.pagedCollection.child(1))
#
#    it 'returned page is a collection', ->
#      page = [{name: 'newValue1'}, {name: 'newValue2'}]
#      this.pagedCollection.setPage([], 0)
#      this.pagedCollection.setPage(page)
#      child = this.pagedCollection.child(1)
#
#      assert.equal(child.type, 'collection')
#      assert.deepEqual(child.mold, [
#        {
#          $pageIndex: 1,
#          $index: 0,
#          name: 'newValue1',
#        },
#        {
#          $pageIndex: 1,
#          $index: 1,
#          name: 'newValue2',
#        },
#      ])
