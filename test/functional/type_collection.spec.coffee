mold = require('../../src/index').default

describe 'Functional. Collection type.', ->
  beforeEach () ->
    this.onSpy = sinon.spy();
    this.testSchema = () ->
      collection:
        type: 'collection'
        item:
          type: 'container'
          schema:
            id: {type: 'number', primary: true}
            name: {type: 'string'}
    this.mold = mold( {silent: true}, this.testSchema() )
    this.mold.onAnyUpdate(this.onSpy)
    this.collection = this.mold.child('collection')

  it 'init value', ->
    assert.deepEqual(this.collection.mold, [])

  it 'child(0)', ->
    this.collection.unshift({id: 0})
    assert.deepEqual(this.collection.child(0).mold, {
      $index: 0,
      id: 0,
    })

  it 'unshift', ->
    this.collection.unshift({id: 0})
    this.collection.unshift({id: 1})
    assert.deepEqual(this.collection.mold, [
      {
        $index: 0,
        id: 1,
      }
      {
        $index: 1,
        id: 0,
      }
    ])
    expect(this.onSpy).to.have.been.calledTwice

  it 'push', ->
    this.collection.push({id: 0})
    this.collection.push({id: 1})
    assert.deepEqual(this.collection.mold, [
      {
        $index: 0,
        id: 0,
      }
      {
        $index: 1,
        id: 1,
      }
    ])
    expect(this.onSpy).to.have.been.calledTwice

  it 'remove', ->
    this.collection.push({id: 0})
    this.collection.push({id: 1})
    this.collection.remove({$index: 0})
    assert.deepEqual(this.collection.mold, [
      {
        $index: 0,
        id: 1,
      }
    ])
    expect(this.onSpy).to.have.been.calledThrice

  it "clear()", ->
    this.collection.push({id: 0})
    this.collection.clear();
    assert.deepEqual(this.collection.mold, [])
