helpers = require('../../src/helpers')

describe 'Unit. helpers.', ->
  # TODO: тесты на cb
  # TODO: тесты на path
  describe 'recursiveMutate.', ->
    it 'primitive update', ->
      sourceData =
        stringValue: 'stringValue top'
        numberValue: 5
        boolValue: false
        nullValue: null
        useless: 'it is going to remove'

      newData =
        stringValue: 'new value'
        numberValue: 6
        boolValue: true
        nullValue: false
        newValue: 'new'

      helpers.recursiveMutate(sourceData, newData)

      assert.deepEqual(sourceData, newData)

    it 'Nested object update', ->
      sourceData =
        stringValue: 'top',
        nested:
          stringValue: 'nested'
          useless: 'it is going to remove'
          uselessNested:
            stringValue: 'very nested'

      newData =
        stringValue: 'new1',
        nested:
          stringValue: 'new2'
          nestedSecond:
            stringValue: 'new3'

      nestedLink = sourceData.nested

      helpers.recursiveMutate(sourceData, newData)

      assert.deepEqual(sourceData, newData)
      assert.equal(nestedLink.stringValue, 'new2')

    it 'Collection common', ->
      sourceData =
        collection: [
          {
            id: 1
            name: 'old name'
            unusedField: 'unused'
          }
          {
            id: 2
            name: 'unused'
          }
        ],
        toClear: [
          {
            id: 1
          }
        ],

      newData =
        collection: [
          {
            id: 1
            name: 'new'
            newField: 'new',
          }
        ],
        toClear: []
        newCollection: [
          {
            id: 1,
            name: 'new'
          }
        ],

      collectionLink = sourceData.collection

      helpers.recursiveMutate(sourceData, newData)

      assert.deepEqual(sourceData, newData)
      assert.equal(collectionLink[0].name, 'new')

    it 'Collection deep', ->
      sourceData = [
        {
          id: 1
          name: 'old name'
          childrenCollection: [
            {
              id: 1,
              name: 'nested old name'
            }
          ]
        }
      ]

      newData = [
        {
          id: 1
          name: 'new1'
          childrenCollection: [
            {
              id: 1,
              name: 'new2'
            }
          ]
        }
      ]

      collectionLink = sourceData[0].childrenCollection

      helpers.recursiveMutate(sourceData, newData)

      assert.deepEqual(sourceData, newData)
      assert.equal(collectionLink[0].name, 'new2')

    it 'Array', ->
      sourceData = {
        arr: ['one', 'two', 'useless']
      }

      newData = {
        arr: ['one1', 'two2']
      }

      helpers.recursiveMutate(sourceData, newData)

      assert.deepEqual(sourceData, newData)

    it 'Array nested', ->
      sourceData = [
        ['one']
      ]

      newData = [
        ['two']
      ]

      helpers.recursiveMutate(sourceData, newData)

      assert.deepEqual(sourceData, newData)

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
        paramPath: '0'
      })
    
    it 'dir1.dir2.file.0.name', ->
      assert.deepEqual(helpers.splitLastParamPath('dir1.dir2.file.0.name'), {
        basePath: 'dir1.dir2.file.0'
        paramPath: 'name'
      })

    it 'dir1.dir2.file.0.param.1', ->
      assert.deepEqual(helpers.splitLastParamPath('dir1.dir2.file.0.param.1'), {
        basePath: 'dir1.dir2.file.0.param'
        paramPath: '1'
      })

    it 'dir1.dir2.file.0.param.1.name', ->
      assert.deepEqual(helpers.splitLastParamPath('dir1.dir2.file.0.param.1.name'), {
        basePath: 'dir1.dir2.file.0.param.1'
        paramPath: 'name'
      })
