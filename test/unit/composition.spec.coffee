Composition = require('../../src/Composition').default

describe 'Unit. Composition.', ->
  beforeEach ->
    this.emitSpy = sinon.spy();
    this.mainMock = {
      events: {
        emit: this.emitSpy
      }
    }
    this.composition = new Composition(this.mainMock)

  describe 'update.', ->
    it 'update primitive', ->
      this.composition._storage = {
        container:
          stringParam: null
      }
      this.composition.update('container.stringParam', 'new value')
      assert.equal(this.composition._storage.container.stringParam, 'new value')
      expect(this.emitSpy).to.have.been.calledWith('mold.composition.update', { path: 'container.stringParam' })
      expect(this.emitSpy).to.have.been.calledOnce

    it 'update array', ->
      # TODO: !!! do it


    it 'update simple container', ->
      this.composition._storage = {
        container:
          stringParam: null
      }
      this.composition.update('container', {stringParam: 'new value'})
      assert.equal(this.composition._storage.container.stringParam, 'new value')
      expect(this.emitSpy).to.have.been.calledWith('mold.composition.update', { path: 'container' })
      expect(this.emitSpy).to.have.been.calledWith('mold.composition.update', { path: 'container.stringParam' })
      expect(this.emitSpy).to.have.been.calledTwice

    it 'update nested container', ->
      # TODO: !!! do it
      

# TODO: !!! do it
#    it 'update container with collection', ->
#    it 'update container with collection with collection', ->
