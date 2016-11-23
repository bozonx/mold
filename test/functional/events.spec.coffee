mold = require('../../src/index').default

describe 'Functional. Events.', ->
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

    this.mold = mold( {}, testSchema() )
    this.handlerContainer = sinon.spy();
    this.handlerNested = sinon.spy();

  describe 'main', ->
    it 'mold.onMoldUpdate()', ->
      this.mold.onMoldUpdate(this.handlerContainer)
      this.container = this.mold.child('container')
      this.container.update({
        stringParam: 'newValue'
      })

      expect(this.handlerContainer).to.have.been.calledOnce
      expect(this.handlerContainer).to.have.been.calledWith({
        path: 'container'
        action: 'change'
      })

  describe 'container', ->
    beforeEach () ->
      this.container = this.mold.child('container')
      this.nested = this.mold.child('container.nested')
      #this.container.onChange(this.handlerContainer)
      #this.nested.onChange(this.handlerNested)

    it 'container.onChange()', ->
      this.container.onChange(this.handlerContainer)
      this.nested.onChange(this.handlerNested)

      this.container.update({ stringParam: 'newValue' })

      expect(this.handlerContainer).to.have.been.calledOnce
      expect(this.handlerContainer).to.have.been.calledWith({
        path: 'container'
        action: 'change'
      })
      expect(this.handlerNested).to.not.have.been.called

    it 'container.onChange() - don\'t rise on parent', ->
      this.container.onChange(this.handlerContainer)
      this.nested.onChange(this.handlerNested)


      this.nested.update({ nestedParam: 'newValue' })

      expect(this.handlerContainer).to.not.have.been.called
      expect(this.handlerNested).to.have.been.calledOnce
      expect(this.handlerNested).to.have.been.calledWith({
        path: 'container.nested'
        action: 'change'
      })

    it 'container.onChangeDeep()', ->
      this.container.onChangeDeep(this.handlerContainer)
      this.nested.onChange(this.handlerNested)

      this.nested.update({ nestedParam: 'newValue' })

      expect(this.handlerContainer).to.have.been.calledOnce
      expect(this.handlerContainer).to.have.been.calledWith({
        path: 'container.nested'
        action: 'change'
      })
      expect(this.handlerNested).to.have.been.calledOnce
      expect(this.handlerNested).to.have.been.calledWith({
        path: 'container.nested'
        action: 'change'
      })

    it 'container.off() with nested', ->
      this.container.onChangeDeep(this.handlerContainer)
      this.nested.onChange(this.handlerNested)

      this.nested.off(this.handlerNested)

      this.nested.update({ nestedParam: 'newValue' })

      expect(this.handlerContainer).to.have.been.calledOnce
      expect(this.handlerContainer).to.have.been.calledWith({
        path: 'container.nested'
        action: 'change'
      })
      expect(this.handlerNested).to.not.have.been.called
      assert.isUndefined(this.mold.$$state._handlers['container.nested'])

  describe 'destroy', ->
    beforeEach () ->
      this.container = this.mold.child('container')
      this.nested = this.mold.child('container.nested')
      this.container.onChangeDeep(this.handlerContainer)
      this.nested.onChange(this.handlerNested)

    it 'not deep', ->
      this.container.destroy()

      this.container.update({ stringParam: 'newValue' })
      this.nested.update({ nestedParam: 'newValue' })

      expect(this.handlerContainer).to.not.have.been.called
      expect(this.handlerNested).to.have.been.calledOnce
      expect(this.handlerNested).to.have.been.calledWith({
        path: 'container.nested'
        action: 'change'
      })

    it 'deep', ->



# TODO: check collection, paged collection
# TODO: проверить что событие не поднимается если значение по факту не изменилось
# TODO: destroy


