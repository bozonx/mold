Storage = require('../../src/Storage').default

describe 'Unit. Storage.', ->
  beforeEach ->
    this.emitSpy = sinon.spy();
    this.eventsMock = {
      emit: this.emitSpy
    }
    this.storage = new Storage(this.eventsMock)

  it 'addToBeginning()', ->
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

  it 'addToEnd()', ->
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

  # TODO: пересмотреть
#  describe 'Update events', ->
#    it 'container bubbling', ->
#      this.storage._storage = {
#        container:
#          stringParam: null
#          unchanged: null
#          nested: {
#            nestedParam: null
#          }
#          nestedUnchanged: {
#            nestedUnchangedParam: null
#          }
#      }
#      this.storage.update('container', {
#        stringParam: 'new value',
#        _id: 'container'
#        nested: {
#          nestedParam: 'new nested value'
#        }
#      });
#
#      expect(this.emitSpy).to.have.been.calledWith('mold.update::container.stringParam', {
#        path: 'container.stringParam'
#        isTarget: true
#        target: {
#          action: 'change',
#          path: 'container.stringParam',
#          #value: 'new value'
#        }
#      })
#      expect(this.emitSpy).to.have.been.calledWith('mold.update::container._id', {
#        path: 'container._id'
#        isTarget: true
#        target: {
#          action: 'change',
#          path: 'container._id',
#          #value: 'container'
#        }
#      })
#      expect(this.emitSpy).to.have.been.calledWith('mold.update::container.nested.nestedParam', {
#        path: 'container.nested.nestedParam'
#        isTarget: true
#        target: {
#          action: 'change',
#          path: 'container.nested.nestedParam',
#          #value: 'new nested value'
#        }
#      })
#
#      # bubbles
##      expect(this.emitSpy).to.have.been.calledWith('mold.update::container.nested', {
##        path: 'container.nested'
##        isTarget: false
##        target: { action: 'change', path: 'container.nested.nestedParam', value: 'new nested value' }
##      })
##      expect(this.emitSpy).to.have.been.calledWith('mold.update::container', {
##        path: 'container'
##        isTarget: false
##        target: { action: 'change', path: 'container.stringParam', value: 'new value' }
##      })
##      # root
##      expect(this.emitSpy).to.have.been.calledWith('mold.update::', {
##        path: ''
##        isTarget: false
##        target: { action: 'change', path: 'container.stringParam', value: 'new value' }
##      })
#
#      #expect(this.emitSpy).to.have.been.callCount(6)
#
#
## TODO: коллекция - установка c нуля
## TODO: коллекция - обновление элемента коллекции - как контейнера
## TODO: коллекция - обновление элемента коллекции и его примитива
## TODO: коллекция - коллекция вложенная в коллекцию
## TODO: полный - установка всего mold - контейнер с коллекцией
## TODO: подъем событий
