Storage = require('../../src/Storage').default

describe 'Unit. Storage.', ->
  beforeEach ->
    this.emitSpy = sinon.spy();
    this.eventsMock = {
      emit: this.emitSpy
    }
    this.storage = new Storage(this.eventsMock)

  describe 'addToBeginning(pathToCollection, newItem)', ->
    it 'to empty', ->
      this.storage._storage = {
        collection: []
      }
      this.storage.addToBeginning('collection', {id: 1})

      assert.deepEqual(this.storage.get('collection'), [
        {
          $index: 0,
          id: 1,
        },
      ])
      expect(this.emitSpy).to.have.been.calledOnce
      expect(this.emitSpy).to.have.been.calledWith('change', {
        path: 'collection',
        action: 'add',
      })

    it 'to not empty', ->
      this.storage._storage = {
        collection: [
          {
            id: 0
          }
        ]
      }
      this.storage.addToBeginning('collection', {id: 1})

      assert.deepEqual(this.storage.get('collection'), [
        {
          $index: 0,
          id: 1,
        },
        {
          $index: 1,
          id: 0,
        },
      ])

  describe 'addToEnd(pathToCollection, newItem)', ->
    it 'to empty', ->
      this.storage._storage = {
        collection: []
      }
      this.storage.addToEnd('collection', {id: 1})

      assert.deepEqual(this.storage.get('collection'), [
        {
          $index: 0,
          id: 1,
        },
      ])

    it 'to not empty', ->
      this.storage._storage = {
        collection: [
          {
            id: 0
          }
        ]
      }
      this.storage.addToEnd('collection', {id: 1})

      assert.deepEqual(this.storage.get('collection'), [
        {
          $index: 0,
          id: 0,
        },
        {
          $index: 1,
          id: 1,
        },
      ])


  describe 'addTo(pathToCollection, newItem, index)', ->
    it 'to empty', ->
      this.storage._storage = {
        collection: []
      }
      this.storage.addTo('collection', {id: 1}, 0)

      assert.deepEqual(this.storage.get('collection'), [
        {
          $index: 0,
          id: 1,
        },
      ])

    it 'replace first', ->
      this.storage._storage = {
        collection: [
          {
            id: 0
          },
        ]
      }
      this.storage.addTo('collection', {id: 1}, 0)

      assert.deepEqual(this.storage.get('collection'), [
        {
          $index: 0,
          id: 1,
        },
      ])

    it 'to second', ->
      this.storage._storage = {
        collection: [
          {
            id: 0
          },
          {
            id: 1
          }
        ]
      }
      this.storage.addTo('collection', {id: 2}, 1)

      assert.deepEqual(this.storage.get('collection'), [
        {
          $index: 0,
          id: 0,
        },
        {
          $index: 1,
          id: 2,
        },
      ])

    it 'to end', ->
      this.storage._storage = {
        collection: [
          {
            id: 0
          },
        ]
      }
      this.storage.addTo('collection', {id: 1}, 1)

      assert.deepEqual(this.storage.get('collection'), [
        {
          $index: 0,
          id: 0,
        },
        {
          $index: 1,
          id: 1,
        },
      ])

    it 'to new end', ->
      this.storage._storage = {
        collection: [
          {
            id: 0
          },
        ]
      }
      this.storage.addTo('collection', {id: 2}, 2)

      assert.deepEqual(this.storage.get('collection[0]'), {
        $index: 0,
        id: 0,
      })
      assert.isUndefined(this.storage.get('collection[1]'))
      assert.deepEqual(this.storage.get('collection[2]'), {
        $index: 2,
        id: 2,
      })

  describe 'remove(pathToCollection, $index)', ->
    it 'will be empty', ->
      this.storage._storage = {
        collection: [
          {
            id: 0
          },
        ]
      }
      this.storage.remove('collection', 0)

      assert.deepEqual(this.storage.get('collection'), [])

    it 'remove from beginning', ->
      this.storage._storage = {
        collection: [
          {
            id: 0
          },
          {
            id: 1
          },
        ]
      }
      this.storage.remove('collection', 0)

      assert.deepEqual(this.storage.get('collection'), [
        {
          $index: 0,
          id: 1,
        },
      ])

    it 'remove from end', ->
      this.storage._storage = {
        collection: [
          {
            id: 0
          },
          {
            id: 1
          },
        ]
      }
      this.storage.remove('collection', 1)

      assert.deepEqual(this.storage.get('collection'), [
        {
          $index: 0,
          id: 0,
        },
      ])

    it 'remove from middle', ->
      this.storage._storage = {
        collection: [
          {
            id: 0
          },
          {
            id: 1
          },
          {
            id: 2
          },
        ]
      }
      this.storage.remove('collection', 1)

      assert.deepEqual(this.storage.get('collection'), [
        {
          $index: 0,
          id: 0,
        },
        {
          $index: 1,
          id: 2,
        },
      ])

# TODO: clear
# TODO: update
# TODO: events - no event















  describe 'update.', ->
    it 'update primitive', ->
      this.storage._storage = {
        container:
          booleanParam: null
          stringParam: null
          numberParam: null
          arrayParam: []
      }
      this.storage.update('container.booleanParam', true)
      this.storage.update('container.stringParam', 'new value')
      this.storage.update('container.numberParam', 5)
      this.storage.update('container.arrayParam', ['value1'])
      assert.deepEqual(this.storage.get('container'), {
        booleanParam: true
        stringParam: 'new value'
        numberParam: 5
        arrayParam: ['value1']
      })

    it 'update complex container', ->
      this.storage._storage = {
        container:
          stringParam: null
          $index: 1
          nested: {
            nestedParam: null
          }
      }
      this.storage.update('container', {
        stringParam: 'new value',
        _id: 'new'
        nested: {
          nestedParam: 'new nested value'
        }
      });
      assert.deepEqual(this.storage.get('container'), {
        stringParam: 'new value'
        _id: 'new'
        $index: 1
        nested: {
          nestedParam: 'new nested value'
        }
      })

    it 'update complex collection', ->
      this.storage._storage = {
        collection: [
          {
            id: 0,
            $index: 0,
            name: 'name0',
          }
          undefined,
          undefined,
          {
            id: 3,
            $index: 3,
            name: 'name3',
          }
        ]
      }
      this.storage.update('collection', [
        {
          id: 0,
          name: 'new name0',
        }
        {
          id: 2,
          name: 'new name2',
        }
      ]);

      assert.deepEqual(this.storage.get('collection'), [
        {
          id: 0,
          $index: 0,
          name: 'new name0',
        }
        {
          id: 2,
          $index: 1,
          name: 'new name2',
        }
      ])
