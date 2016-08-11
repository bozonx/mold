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

  it 'primitive onMoldUpdate and offMoldUpdate', () ->
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
    this.primitive.setMold('very new value')
    assert.deepEqual(this.mold.state._handlers['inMemory.stringParam'], [])
    expect(this.handler).to.have.been.calledOnce

  it 'destroy', () ->
    this.primitive.onMoldUpdate(this.handler)
    this.primitive.setMold('new value')

    assert.equal(this.primitive.mold, 'new value')

    this.primitive.destroy()

    assert.deepEqual(this.mold.state._handlers['inMemory.stringParam'], [])

    assert.equal(this.primitive.mold, null)



# TODO: должен работать после того как сделаю bubble

#  it 'container onMoldUpdate and offMoldUpdate', () ->
#    this.container.onMoldUpdate(this.handler)
#    this.container.setMold('stringParam', 'new value')
#
#    assert.deepEqual(this.mold.state._handlers['inMemory'], [this.handler])
#    expect(this.handler).to.have.been.calledOnce
#    expect(this.handler).to.have.been.calledWith({
#      path: 'inMemory'
#      isTarget: false
#      target: {
#        path: 'inMemory.stringParam'
#        action: 'change'
#        value: 'new value'
#      }
#    })
#
#    this.container.offMoldUpdate(this.handler)
#    this.container.setMold('stringParam', 'very new value')
#    assert.deepEqual(this.mold.state._handlers['inMemory'], [])
#    expect(this.handler).to.have.been.calledOnce

# TODO: проверить что событие не поднимается если значение по факту не изменилось
# TODO: проверить что у контейнера поднимится событие, если мы устанавливаем значение через примитив
# TODO: проверить коллекции
# TODO: проверить баблинг
