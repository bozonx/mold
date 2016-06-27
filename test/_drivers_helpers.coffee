module.exports =
  check_responce_set_primitive: (docContainer) ->
    # TODO: use another primitives
    promise = docContainer.set('stringParam', 'new value')
    expect(promise).to.eventually.property('payload').equal('new value')

  set_and_get_primitive: (docContainer, done) ->
    # TODO: use another primitives
    promise = docContainer.set('stringParam', 'new value')
    expect(promise).to.eventually.notify =>
      expect(docContainer.get('stringParam')).to.eventually.property('payload').equal('new value').notify(done)

  check_responce_set_array: (docContainer) ->
    value = [1,2,3]
    promise = docContainer.set('arrayParam', value)
    expect(promise).to.eventually.property('payload').deep.equal(value)

  set_and_get_array: (docContainer, done) ->
    value = [1,2,3]
    promise = docContainer.set('arrayParam', value)
    expect(promise).notify =>
      expect(docContainer.get('arrayParam')).to.eventually.property('payload').deep.equal(value).notify(done)
