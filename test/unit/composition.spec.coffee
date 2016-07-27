Composition = require('../../src/Composition').default

describe 'Unit. Composition.', ->
  beforeEach ->
    this.emitSpy = sinon.spy();
    this.eventsMock = {
      emit: this.emitSpy
    }
    this.composition = new Composition(this.eventsMock)

  describe 'update.', ->
    it 'update primitive', ->
      this.composition._storage = {
        container:
          booleanParam: null
          stringParam: null
          numberParam: null
          arrayParam: []
      }
      this.composition.update2('container.booleanParam', true)
      this.composition.update2('container.stringParam', 'new value')
      this.composition.update2('container.numberParam', 5)
      this.composition.update2('container.arrayParam', ['value1'])
      assert.deepEqual(this.composition.get('container'), {
        booleanParam: true
        stringParam: 'new value'
        numberParam: 5
        arrayParam: ['value1']
      })

    it 'update complex container', ->
      this.composition._storage = {
        container:
          stringParam: null
          $index: 1
          nested: {
            nestedParam: null
          }
      }
      this.composition.update2('container', {
        stringParam: 'new value',
        _id: 'new'
        nested: {
          nestedParam: 'new nested value'
        }
      });
      assert.deepEqual(this.composition.get('container'), {
        stringParam: 'new value'
        _id: 'new'
        $index: 1
        nested: {
          nestedParam: 'new nested value'
        }
      })

    it 'update complex collection', ->
      this.composition._storage = {
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
      this.composition.update2('collection', [
        {
          id: 0,
          name: 'new name0',
        }
        {
          id: 2,
          name: 'new name2',
        }
      ]);
      
      assert.deepEqual(this.composition.get('collection'), [
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
      

# TODO: коллекция - установка c нуля
# TODO: коллекция - обновление элемента коллекции - как контейнера
# TODO: коллекция - обновление элемента коллекции и его примитива
# TODO: коллекция - коллекция вложенная в коллекцию
# TODO: полный - установка всего mold - контейнер с коллекцией
# TODO: подъем событий

      
#    it 'update primitive', ->
#      this.composition._storage = {
#        container:
#          stringParam: null
#      }
#      this.composition.update('container.stringParam', 'new value')
#      assert.equal(this.composition._storage.container.stringParam, 'new value')
#      expect(this.emitSpy).to.have.been.calledWith('mold.composition.update', {
#        path: 'container.stringParam', action: 'update' })
#      expect(this.emitSpy).to.have.been.calledOnce
#
#    it 'update primitive - same value - event doesn\'t rise', ->
#      this.composition._storage = {
#        container:
#          stringParam: 'new value'
#      }
#      this.composition.update('container.stringParam', 'new value')
#      assert.equal(this.composition._storage.container.stringParam, 'new value')
#      expect(this.emitSpy).to.have.been.callCount(0)
#
#    it 'update simple container', ->
#      this.composition._storage = {
#        container:
#          stringParam: null
#      }
#      this.composition.update('container', {stringParam: 'new value'})
#      assert.equal(this.composition._storage.container.stringParam, 'new value')
#      expect(this.emitSpy).to.have.been.calledWith('mold.composition.update', {
#        path: 'container', action: 'update' })
#      expect(this.emitSpy).to.have.been.calledWith('mold.composition.update', {
#        path: 'container.stringParam', action: 'update' })
#      expect(this.emitSpy).to.have.been.calledTwice
#
#    it 'update simple container - same value - event doesn\'t rise', ->
#      this.composition._storage = {
#        container:
#          stringParam: 'new value'
#      }
#      this.composition.update('container', {stringParam: 'new value'})
#      assert.equal(this.composition._storage.container.stringParam, 'new value')
#      expect(this.emitSpy).to.have.been.callCount(0)
