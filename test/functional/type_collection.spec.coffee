mold = require('../../src/index').default

describe 'Functional. Collection type.', ->
  beforeEach () ->
    this.testSchema = () ->
      collection:
        type: 'collection'
        item:
          type: 'container'
          schema:
            id: {type: 'number', primary: true}
            name: {type: 'string'}
    this.testValues = [
      {
        id: 0
      },
      {
        id: 1
      },
    ]
    this.mold = mold( {}, this.testSchema() )
    this.collection = this.mold.instance('collection')

  it 'init value', ->
    assert.deepEqual(this.collection.mold, [])

  it 'child(0)', ->
    this.collection.unshift({id: 0})
    assert.deepEqual(this.collection.child(0).mold, {
      $index: 0,
      id: 0,
    })

  it 'unshift', ->
    this.collection.unshift({id: 0})
    this.collection.unshift({id: 1})
    assert.deepEqual(this.collection.mold, [
      {
        $index: 0,
        id: 1,
      }
      {
        $index: 1,
        id: 0,
      }
    ])
    # TODO: listen to change event twice

  it 'push', ->

  it 'addTo', ->

  it 'remove', ->








#  describe 'complex', ->
#    beforeEach () ->
#      this.mold = mold( {}, testSchema() )
#      this.collectionParam = this.mold.instance('inMemory.collectionParam')
#
#    it 'Many manupulations with collection', (done) ->
#      this.collectionParam.unshift({name: 'name0'})
#      this.collectionParam.unshift({name: 'name1'})
#      this.collectionParam.unshift({name: 'name2'})
#
#      assert.deepEqual _.compact(this.collectionParam.mold), [
#        {
#          name: 'name2'
#          $index: 0
#          $isNew: true
#        }
#        {
#          name: 'name1'
#          $index: 1
#          $isNew: true
#        }
#        {
#          name: 'name0'
#          $index: 2
#          $isNew: true
#        }
#      ]
#
#      this.collectionParam.removeMold(this.collectionParam.mold[1])
#      this.collectionParam.child(1).setMold('name', 'new name')
#      assert.deepEqual _.compact(this.collectionParam.mold), [
#        {
#          name: 'name2'
#          $index: 0
#          $isNew: true
#        }
#        {
#          name: 'new name'
#          $index: 1
#          $isNew: true
#        }
#      ]
#
#      expect(this.collectionParam.save()).to.eventually.notify =>
#        expect(Promise.resolve(this.collectionParam.mold)).to.eventually
#        .deep.equal([
#          {
#            id: 0
#            name: 'name2'
#            $index: 0
#          }
#          {
#            id: 1
#            name: 'new name'
#            $index: 1
#          }
#        ])
#        .notify(done)
#
#      # TODO: проверить - удаленный элемент не должен сохраняться, так как он новосозданный
