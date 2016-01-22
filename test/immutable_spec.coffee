Immutable = require('immutable')
describe 'immutable', ->
  it '1111', ->
    map1 = Immutable.fromJS({a:1, b:2, fff: {ggg: 1}});
    map2 = map1.set('b', 50)
    assert.equal(map1.get('b'), 2)
    assert.equal(map2.get('b'), 50)

    map3 = map2.setIn(['fff', 'ggg'], 3)
    assert.equal(map1.getIn(['fff', 'ggg']), 1)
    assert.equal(map3.getIn(['fff', 'ggg']), 3)

    map1.get('fff').ggg = 6
    assert.equal(map1.getIn(['fff', 'ggg']), 1)

    js2 = {a:1, b:2};
    map21 = Immutable.Map(js2)
    js2.a = 4
    assert.equal(map21.get('a'), 1)

    map4 = Immutable.Map({a:1, b:2});
    assert.equal(map4.toJS().a, 1)
