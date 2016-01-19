var mold = require('../lib/index.js');

describe('schema', function() {
  it('set param', function () {
    mold.schema('test', 'val');
    assert.equal(mold.schema('test'), 'val');
  });
});
