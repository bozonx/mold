helpers = require('../../src/helpers')

describe 'Unit. helpers.', ->
  describe 'getTheBestMatchPath.', ->
    it 'bad path', ->
      assert.isUndefined(helpers.getTheBestMatchPath('two', ['one.two']))
      assert.isUndefined(helpers.getTheBestMatchPath('two.three', ['one.two']))

    it 'get one path', ->
      assert.equal(helpers.getTheBestMatchPath('one.two', ['one.two']), 'one.two')
      assert.equal(helpers.getTheBestMatchPath('one.two.three', ['one.two']), 'one.two')

    it 'get the longest', ->
      paths = ['one.two', 'one', 'one.two.three.four', 'one.two.three']
      assert.equal(helpers.getTheBestMatchPath('one', paths), 'one')
      assert.equal(helpers.getTheBestMatchPath('one.other', paths), 'one')
      assert.equal(helpers.getTheBestMatchPath('one.two', paths), 'one.two')
      assert.equal(helpers.getTheBestMatchPath('one.two.other', paths), 'one.two')
      assert.equal(helpers.getTheBestMatchPath('one.two.three.other', paths), 'one.two.three')
      assert.equal(helpers.getTheBestMatchPath('one.two.three.four.other', paths), 'one.two.three.four')

  describe 'splitLastParamPath.', ->
    it 'dir1.dir2.file', ->
      assert.deepEqual(helpers.splitLastParamPath('dir1.dir2.file'), {
        basePath: 'dir1.dir2'
        paramPath: 'file'
      })
      
    it 'dir1.dir2.file.0', ->
      assert.deepEqual(helpers.splitLastParamPath('dir1.dir2.file.0'), {
        basePath: 'dir1.dir2.file'
        paramPath: 0
      })
    
    it 'dir1.dir2.file.0.name', ->
      assert.deepEqual(helpers.splitLastParamPath('dir1.dir2.file.0.name'), {
        basePath: 'dir1.dir2.file.0'
        paramPath: 'name'
      })
    
    it 'dir1.dir2.file.0.param.1', ->
      assert.deepEqual(helpers.splitLastParamPath('dir1.dir2.file.0.param.1'), {
        basePath: 'dir1.dir2.file.0.param'
        paramPath: 1
      })
    
    it 'dir1.dir2.file.0.param.1.name', ->
      assert.deepEqual(helpers.splitLastParamPath('dir1.dir2.file.0.param.1.name'), {
        basePath: 'dir1.dir2.file.0.param.1'
        paramPath: 'name'
      })
