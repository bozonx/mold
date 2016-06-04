stateSchema = require('stateSchema')

testSchema = () ->
  memoryBranch:
    inMemory:
      listParam:
        type: 'list'
        item: {
          id: {type: 'number'}
          name: {type: 'string'}
        }

describe 'Functional. List instance', ->
  beforeEach () ->
    this.state = stateSchema.initSchema( testSchema() )
    this.inMemory = this.state.instance('memoryBranch.inMemory')

  it 'Check instatnce of list', ->

  it 'Init list and get items', ->

