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
          stringParam: null
      }
      this.composition.update('container.stringParam', 'new value')
      assert.equal(this.composition._storage.container.stringParam, 'new value')
      expect(this.emitSpy).to.have.been.calledWith('mold.composition.update', {
        path: 'container.stringParam', action: 'update' })
      expect(this.emitSpy).to.have.been.calledOnce

    it 'update primitive - same value - event doesn\'t rise', ->
      this.composition._storage = {
        container:
          stringParam: 'new value'
      }
      this.composition.update('container.stringParam', 'new value')
      assert.equal(this.composition._storage.container.stringParam, 'new value')
      expect(this.emitSpy).to.have.been.callCount(0)

    it 'update simple container', ->
      this.composition._storage = {
        container:
          stringParam: null
      }
      this.composition.update('container', {stringParam: 'new value'})
      assert.equal(this.composition._storage.container.stringParam, 'new value')
      expect(this.emitSpy).to.have.been.calledWith('mold.composition.update', {
        path: 'container', action: 'update' })
      expect(this.emitSpy).to.have.been.calledWith('mold.composition.update', {
        path: 'container.stringParam', action: 'update' })
      expect(this.emitSpy).to.have.been.calledTwice

    it 'update simple container - same value - event doesn\'t rise', ->
      this.composition._storage = {
        container:
          stringParam: 'new value'
      }
      this.composition.update('container', {stringParam: 'new value'})
      assert.equal(this.composition._storage.container.stringParam, 'new value')
      expect(this.emitSpy).to.have.been.callCount(0)

    # TODO: проверить установку всего storage

    it 'update nested container', ->
      # TODO: !!! do it

    it 'update array', ->
      # TODO: !!! do it

      # TODO: событие не должно подниматься если элемент не изменился



# TODO: !!! do it
#    it 'update container with collection', ->
#    it 'update container with collection with collection', ->
