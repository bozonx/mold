mold = require('../../src/index').default
Memory = require('../../src/drivers/Memory').default



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
        name: 'name0'
      },
      {
        id: 1
        name: 'name1'
      },
    ]
    this.mold = mold( {}, this.testSchema() )
    this.collectionParam = this.mold.instance('collection')

  describe 'init, child(), child(num)', ->
    it 'init value', ->
      assert.deepEqual(this.collectionParam.mold, [])

    it 'child(0)', ->
      this.collectionParam.unshift({name: 'name0'})
      assert.deepEqual(this.collectionParam.child(0).mold, {
        $index: 0,
        $isNew: true,
        name: 'name0',
      })










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
