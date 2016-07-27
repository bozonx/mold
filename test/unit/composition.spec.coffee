Composition = require('../../src/Composition').default

describe 'Unit. Composition.', ->
  beforeEach ->
    this.emitSpy = sinon.spy();
    this.eventsMock = {
      emit: this.emitSpy
    }
    this.composition = new Composition(this.eventsMock)

  describe 'update.', ->
    # TODO: обновить примитив - массив
    # TODO: коллекция - установка c нуля
    # TODO: коллекция - обновление всей коллекции
    # TODO: коллекция - при обновлении коллекции - удалять лишние
    # TODO: коллекция - обновление элемента коллекции - как контейнера
    # TODO: коллекция - обновление элемента коллекции и его примитива
    # TODO: коллекция - коллекция вложенная в коллекцию
    # TODO: полный - установка всего mold
    # TODO: подъем событий


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

    it 'update container with new params', ->
      this.composition._storage = {
        container:
          stringParam: null
          $index: 1
      }
      this.composition.update2('container', {
        stringParam: 'new value',
        _id: 'new'
      });
      assert.deepEqual(this.composition.get('container'), {
        stringParam: 'new value'
        _id: 'new'
        $index: 1
      })


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

#    # TODO: проверить установку всего storage
#
#    it 'update nested container', ->
#      # TODO: !!! do it
#
#    it 'update array', ->
#      # TODO: !!! do it
#
#      # TODO: событие не должно подниматься если элемент не изменился



# TODO: !!! do it
#    it 'update container with collection', ->
#    it 'update container with collection with collection', ->
