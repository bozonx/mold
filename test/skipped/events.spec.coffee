mold = require('../../src/index').default

# TODO: check collection, paged collection


describe.skip 'Functional. Events.', ->
  beforeEach () ->
    testSchema = () ->
      container:
        type: 'container'
        schema:
          stringParam: {type: 'string'}
          nested:
            type: 'container'
            schema:
              nestedParam: {type: 'string'}

    this.mold = mold( {silent: true}, testSchema() )
    this.handlerContainer = sinon.spy();
    this.handlerNested = sinon.spy();

  describe 'main', ->
    it 'mold.onChange()', ->
      this.mold.onChange(this.handlerContainer)
      this.container = this.mold.child('container')
      this.container.update({
        stringParam: 'newValue'
      })

      expect(this.handlerContainer).to.have.been.calledOnce
      expect(this.handlerContainer).to.have.been.calledWith({
        storagePath: 'container'
        action: 'change'
      })

    it 'mold.off()', ->
      this.mold.onChange(this.handlerContainer)
      this.container = this.mold.child('container')
      this.mold.off(this.handlerContainer)
      this.container.update({
        stringParam: 'newValue'
      })

      expect(this.handlerContainer).to.not.have.been.called

  describe 'container', ->
    beforeEach () ->
      this.container = this.mold.child('container')
      this.nested = this.mold.child('container.nested')
      this.nested.onChange(this.handlerNested)

    it 'container.onChange()', ->
      this.container.onChange(this.handlerContainer)
      this.container.update({ stringParam: 'newValue' })

      expect(this.handlerContainer).to.have.been.calledOnce
      expect(this.handlerContainer).to.have.been.calledWith({
        storagePath: 'container'
        action: 'change'
      })
      expect(this.handlerNested).to.not.have.been.called

    it 'container.onChange() - don\'t rise on parent', ->
      this.container.onChange(this.handlerContainer)

      this.nested.update({ nestedParam: 'newValue' })

      expect(this.handlerContainer).to.not.have.been.called
      expect(this.handlerNested).to.have.been.calledOnce
      expect(this.handlerNested).to.have.been.calledWith({
        storagePath: 'container.nested'
        action: 'change'
      })

    it 'container.onChangeDeep()', ->
      this.container.onChangeDeep(this.handlerContainer)
      this.nested.update({ nestedParam: 'newValue' })

      expect(this.handlerContainer).to.have.been.calledOnce
      expect(this.handlerContainer).to.have.been.calledWith({
        storagePath: 'container.nested'
        action: 'change'
      })
      expect(this.handlerNested).to.have.been.calledOnce
      expect(this.handlerNested).to.have.been.calledWith({
        storagePath: 'container.nested'
        action: 'change'
      })

    it 'container.off() with nested', ->
      this.container.onChangeDeep(this.handlerContainer)
      this.nested.off(this.handlerNested)

      this.nested.update({ nestedParam: 'newValue' })

      expect(this.handlerContainer).to.have.been.calledOnce
      expect(this.handlerContainer).to.have.been.calledWith({
        storagePath: 'container.nested'
        action: 'change'
      })
      expect(this.handlerNested).to.not.have.been.called
      assert.isUndefined(this.mold.$$state._handlers['container.nested'])

    it "don't rise an event if value isn't changed", ->
      this.container.onChange(this.handlerContainer)

      this.container.update({ stringParam: 'newValue' })
      this.container.update({ stringParam: 'newValue' })

      expect(this.handlerContainer).to.have.been.calledOnce

  describe 'destroy', ->
    beforeEach () ->
      this.container = this.mold.child('container')
      this.nested = this.mold.child('container.nested')
      this.nested.onChange(this.handlerNested)

    it 'not deep', ->
      this.container.onChangeDeep(this.handlerContainer)
      this.container.destroy()

      this.container.update({ stringParam: 'newValue' })
      this.nested.update({ nestedParam: 'newValue' })

      expect(this.handlerContainer).to.not.have.been.called
      expect(this.handlerNested).to.have.been.calledOnce
      expect(this.handlerNested).to.have.been.calledWith({
        storagePath: 'container.nested'
        action: 'change'
      })

    it 'deep', ->
      this.container.onChangeDeep(this.handlerContainer)
      this.container.destroyDeep()

      this.container.update({ stringParam: 'newValue' })
      this.nested.update({ nestedParam: 'newValue' })

      expect(this.handlerContainer).to.not.have.been.called
      expect(this.handlerNested).to.not.have.been.called

  describe 'silent / any change', ->
    it 'on container init', ->
      this.mold.onAnyChange(this.handlerContainer)
      this.container = this.mold.child('container')

      expect(this.handlerContainer).to.have.been.calledOnce
      expect(this.handlerContainer).to.have.been.calledWith({
        storagePath: 'container'
        action: 'change'
      })
