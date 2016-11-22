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

  describe 'mold, container', ->
    it 'mold.onMoldUpdate()', ->
      this.mold.onMoldUpdate(this.handlerContainer)
      container = this.mold.child('container')
      container.update({
        stringParam: 'newValue'
      })

      expect(this.handlerContainer).to.have.been.calledOnce
      expect(this.handlerContainer).to.have.been.calledWith({
        path: 'container'
        action: 'change'
      })

    it 'container.onChange()', ->
      container = this.mold.child('container')
      container.onChange(this.handlerContainer)
      nested = this.mold.child('container.nested')
      nested.onChange(this.handlerNested)

      container.update({
        stringParam: 'newValue'
       })

      expect(this.handlerContainer).to.have.been.calledOnce
      expect(this.handlerContainer).to.have.been.calledWith({
        path: 'container'
        action: 'change'
      })
      expect(this.handlerNested).to.not.have.been.called

    it 'container.onChange() - don\'t rise on parent', ->
      container = this.mold.child('container')
      container.onChange(this.handlerContainer)
      nested = this.mold.child('container.nested')
      nested.onChange(this.handlerNested)

      nested.update({
        nestedParam: 'newValue'
      })

      expect(this.handlerContainer).to.not.have.been.called
      expect(this.handlerNested).to.have.been.calledOnce
      expect(this.handlerNested).to.have.been.calledWith({
        path: 'container.nested'
        action: 'change'
      })

    it 'container.onChangeDeep()', ->
      container = this.mold.child('container')
      container.onChangeDeep(this.handlerContainer)
      nested = this.mold.child('container.nested')
      nested.onChange(this.handlerNested)

      nested.update({
        nestedParam: 'newValue'
      })

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
      container = this.mold.child('container')
      container.onChangeDeep(this.handlerContainer)
      nested = this.mold.child('container.nested')
      nested.onChange(this.handlerNested)

      nested.off(this.handlerNested)

      nested.update({
        nestedParam: 'newValue'
      })

      expect(this.handlerContainer).to.have.been.calledOnce
      expect(this.handlerContainer).to.have.been.calledWith({
        path: 'container.nested'
        action: 'change'
      })
      expect(this.handlerNested).to.not.have.been.called
      assert.isUndefined(this.mold.$$state._handlers['container.nested'])


# TODO: check collection, paged collection
# TODO: проверить что событие не поднимается если значение по факту не изменилось
# TODO: destroy

