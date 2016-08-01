mold = require('../../src/index')

testSchema = () ->
  inMemory:
    stringParam:
      type: 'string'

describe 'Functional. Events.', ->
  beforeEach () ->
    this.mold = mold.initSchema( {}, testSchema() )
    this.container = this.mold.instance('inMemory')
    this.primitive = this.container.child('stringParam')
    this.handler = sinon.spy();

  it 'onMoldUpdate and offMoldUpdate', () ->
    this.primitive.onMoldUpdate(this.handler)

    this.primitive.setMold('new value')

    assert.deepEqual(this.mold.state._handlers['inMemory.stringParam'], [this.handler])

    expect(this.handler).to.have.been.calledOnce

    expect(this.handler).to.have.been.calledWith({
      path: 'inMemory.stringParam'
      isTarget: true
      target: {
        path: 'inMemory.stringParam'
        action: 'change'
        value: 'new value'
      }
    })

    this.primitive.offMoldUpdate(this.handler)
    this.primitive.setMold('new value')
    assert.deepEqual(this.mold.state._handlers['inMemory.stringParam'], [])
    expect(this.handler).to.have.been.calledOnce
