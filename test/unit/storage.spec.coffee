Storage = require('../../src/Storage').default

describe.only 'Unit. Storage.', ->
  beforeEach ->
    @emitSpy = sinon.spy()
    @eventsMock = {
      emit: @emitSpy
    }
    @storage = new Storage(@eventsMock)
    @moldPath = 'path.to[256]'

  describe 'bottom level', ->
    it 'set new data twice', ->
      newData1 = {
        id: 1
        param1: 'value1'
        param2: 'value2'
      }
      newData2 = {
        id: 2
        param1: 'value11'
      }

      @storage.$init({})
      @storage.setBottomLevel(@moldPath, newData1)
      @storage.setBottomLevel(@moldPath, newData2)

      expect(@storage.get(@moldPath)).to.be.deep.equal(newData2)

  describe 'top level', ->
    it 'set new data and update it', ->
      newData1 = {
        id: 1
        param1: 'value1'
        param2: 'value2'
      }
      newData2 = {
        id: 2
        param1: 'value11'
      }

      @storage.$init({})
      @storage.updateTopLevel(@moldPath, newData1)
      @storage.updateTopLevel(@moldPath, newData2)

      expect(@storage.get(@moldPath)).to.be.deep.equal {
        id: 2
        param1: 'value11'
        param2: 'value2'
      }

    it 'combine with bottom level', ->
      bottomData = {
        id: 1
        param1: 'value1'
        param2: 'value2'
      }
      topData = {
        param2: 'value22'
        param3: 'value3'
      }

      @storage.$init({})
      @storage.setBottomLevel(@moldPath, bottomData)
      @storage.updateTopLevel(@moldPath, topData)

      expect(@storage.get(@moldPath)).to.be.deep.equal {
        id: 1
        param1: 'value1'
        param2: 'value22'
        param3: 'value3'
      }




#  beforeEach ->
#    this.emitSpy = sinon.spy();
#    this.eventsMock = {
#      emit: this.emitSpy
#    }
#    this.storage = new Storage(this.eventsMock)
#
#    this.checkEvent = (storagePath, action) =>
#      expect(this.emitSpy).to.have.been.calledTwice
#      expect(this.emitSpy).to.have.been.calledWith('change', {
#        storagePath: storagePath,
#        action: action,
#      })
#
#
#  describe 'update.', ->
#    it 'nothing to update', ->
#      newData = {
#        stringParam: 'value'
#      }
#      this.storage._storage = {
#        container: newData
#      }
#      this.storage.update('container', newData)
#
#      assert.deepEqual(this.storage.get('container'), newData)
#      expect(this.emitSpy).to.not.have.been.called
#
#    it 'complex update', ->
#      this.storage._storage = {
#        container:
#          booleanParam: null
#          stringParam: null
#          numberParam: null
#          arrayParam: []
#          nested: {
#            nestedParam: null
#          }
#          collection: []
#      }
#      newData = {
#        booleanParam: true
#        stringParam: 'newValue'
#        numberParam: 5
#        arrayParam: [1,2,3]
#        nested: {
#          nestedParam: 'nested'
#        }
#        collection: [
#          { id: 1 }
#        ]
#      }
#      this.storage.update('container', newData)
#
#      assert.deepEqual(this.storage.get('container'), {
#        booleanParam: true
#        stringParam: 'newValue'
#        numberParam: 5
#        arrayParam: [1,2,3]
#        nested: {
#          nestedParam: 'nested'
#        }
#        collection: [
#          {
#            $index: 0,
#            id: 1,
#          }
#        ]
#      })
#      this.checkEvent('container', 'change')
#
#    it 'update collection', ->
#      this.storage._storage = {
#        collection: []
#      }
#      newData = [
#        { id: 1 }
#      ]
#      this.storage.update('collection', newData)
#
#      assert.deepEqual(this.storage.get('collection'), [
#        {
#          $index: 0,
#          id: 1,
#        }
#      ])
#      this.checkEvent('collection', 'change')
#
#
#  describe 'unshift(pathToCollection, newItem)', ->
#    it 'to empty', ->
#      this.storage._storage = {
#        collection: []
#      }
#      this.storage.unshift('collection', {id: 1})
#
#      assert.deepEqual(this.storage.get('collection'), [
#        {
#          $index: 0,
#          id: 1,
#        },
#      ])
#      this.checkEvent('collection', 'add')
#
#    it 'to not empty', ->
#      this.storage._storage = {
#        collection: [
#          {
#            id: 0
#          }
#        ]
#      }
#      this.storage.unshift('collection', {id: 1})
#
#      assert.deepEqual(this.storage.get('collection'), [
#        {
#          $index: 0,
#          id: 1,
#        },
#        {
#          $index: 1,
#          id: 0,
#        },
#      ])
#      this.checkEvent('collection', 'add')
#
#  describe 'push(pathToCollection, newItem)', ->
#    it 'to empty', ->
#      this.storage._storage = {
#        collection: []
#      }
#      this.storage.push('collection', {id: 1})
#
#      assert.deepEqual(this.storage.get('collection'), [
#        {
#          $index: 0,
#          id: 1,
#        },
#      ])
#      this.checkEvent('collection', 'add')
#
#    it 'to not empty', ->
#      this.storage._storage = {
#        collection: [
#          {
#            id: 0
#          }
#        ]
#      }
#      this.storage.push('collection', {id: 1})
#
#      assert.deepEqual(this.storage.get('collection'), [
#        {
#          $index: 0,
#          id: 0,
#        },
#        {
#          $index: 1,
#          id: 1,
#        },
#      ])
#      this.checkEvent('collection', 'add')
#
#
#  describe 'addTo(pathToCollection, newItem, index)', ->
#    it 'nothing to change', ->
#      this.storage._storage = {
#        collection: [
#          {
#            $index: 0,
#            id: 1,
#          },
#        ]
#      }
#      this.storage.addTo('collection', {id: 1}, 0)
#
#      assert.deepEqual(this.storage.get('collection'), [
#        {
#          $index: 0,
#          id: 1,
#        },
#      ])
#      expect(this.emitSpy).to.not.have.been.called
#
#    it 'to empty', ->
#      this.storage._storage = {
#        collection: []
#      }
#      this.storage.addTo('collection', {id: 1}, 0)
#
#      assert.deepEqual(this.storage.get('collection'), [
#        {
#          $index: 0,
#          id: 1,
#        },
#      ])
#      this.checkEvent('collection', 'add')
#
#    it 'replace first', ->
#      this.storage._storage = {
#        collection: [
#          {
#            id: 0
#          },
#        ]
#      }
#      this.storage.addTo('collection', {id: 1}, 0)
#
#      assert.deepEqual(this.storage.get('collection'), [
#        {
#          $index: 0,
#          id: 1,
#        },
#      ])
#      this.checkEvent('collection', 'change')
#
#    it 'to second', ->
#      this.storage._storage = {
#        collection: [
#          {
#            id: 0
#          },
#          {
#            id: 1
#          }
#        ]
#      }
#      this.storage.addTo('collection', {id: 2}, 1)
#
#      assert.deepEqual(this.storage.get('collection'), [
#        {
#          $index: 0,
#          id: 0,
#        },
#        {
#          $index: 1,
#          id: 2,
#        },
#      ])
#      this.checkEvent('collection', 'change')
#
#    it 'to end', ->
#      this.storage._storage = {
#        collection: [
#          {
#            id: 0
#          },
#        ]
#      }
#      this.storage.addTo('collection', {id: 1}, 1)
#
#      assert.deepEqual(this.storage.get('collection'), [
#        {
#          $index: 0,
#          id: 0,
#        },
#        {
#          $index: 1,
#          id: 1,
#        },
#      ])
#      this.checkEvent('collection', 'add')
#
#    it 'to new end', ->
#      this.storage._storage = {
#        collection: [
#          {
#            id: 0
#          },
#        ]
#      }
#      this.storage.addTo('collection', {id: 2}, 2)
#
#      assert.deepEqual(this.storage.get('collection[0]'), {
#        $index: 0,
#        id: 0,
#      })
#      assert.isUndefined(this.storage.get('collection[1]'))
#      assert.deepEqual(this.storage.get('collection[2]'), {
#        $index: 2,
#        id: 2,
#      })
#      this.checkEvent('collection', 'add')
#
#
#  describe 'remove(pathToCollection, $index)', ->
#    it 'nothing to remove', ->
#      this.storage._storage = {
#        collection: []
#      }
#      this.storage.remove('collection', 0)
#
#      assert.deepEqual(this.storage.get('collection'), [])
#      expect(this.emitSpy).to.not.have.been.called
#
#    it 'will be empty', ->
#      this.storage._storage = {
#        collection: [
#          {
#            id: 0
#          },
#        ]
#      }
#      this.storage.remove('collection', 0)
#
#      assert.deepEqual(this.storage.get('collection'), [])
#      this.checkEvent('collection', 'remove')
#
#    it 'remove from beginning', ->
#      this.storage._storage = {
#        collection: [
#          {
#            id: 0
#          },
#          {
#            id: 1
#          },
#        ]
#      }
#      this.storage.remove('collection', 0)
#
#      assert.deepEqual(this.storage.get('collection'), [
#        {
#          $index: 0,
#          id: 1,
#        },
#      ])
#      this.checkEvent('collection', 'remove')
#
#    it 'remove from end', ->
#      this.storage._storage = {
#        collection: [
#          {
#            id: 0
#          },
#          {
#            id: 1
#          },
#        ]
#      }
#      this.storage.remove('collection', 1)
#
#      assert.deepEqual(this.storage.get('collection'), [
#        {
#          $index: 0,
#          id: 0,
#        },
#      ])
#      this.checkEvent('collection', 'remove')
#
#    it 'remove from middle', ->
#      this.storage._storage = {
#        collection: [
#          {
#            id: 0
#          },
#          {
#            id: 1
#          },
#          {
#            id: 2
#          },
#        ]
#      }
#      this.storage.remove('collection', 1)
#
#      assert.deepEqual(this.storage.get('collection'), [
#        {
#          $index: 0,
#          id: 0,
#        },
#        {
#          $index: 1,
#          id: 2,
#        },
#      ])
#      this.checkEvent('collection', 'remove')
#
#  describe 'clear(path)', ->
#    it 'nothing to clear', ->
#      this.storage._storage = {
#        collection: []
#      }
#      this.storage.clear('collection')
#
#      assert.deepEqual(this.storage.get('collection'), [])
#      expect(this.emitSpy).to.not.have.been.called
#
#    it 'complex clear', ->
#      this.storage._storage = {
#        container:
#          param: 'value'
#          nested:
#            array: [0,1,2]
#            number: 5
#            bool: true
#          collection: [ { id: 0 } ]
#      }
#      this.storage.clear('container')
#
#      assert.deepEqual(this.storage.get('container'), {
#        nested:
#          array: []
#        collection: []
#      })
#      this.checkEvent('container', 'change')
