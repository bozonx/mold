## Test events and usaved lists. Don't test mutate here.
#mold = require('../../src/index').default
#
#describe 'Functional. Request.', ->
#  beforeEach () ->
#    testSchema = () ->
#      collection:
#        type: 'documentsCollection'
#        item:
#          type: 'document'
#          schema:
#            id: {type: 'number', primary: true}
#            stringParam: {type: 'string'}
#
#    this.mold = mold( {}, testSchema() )
#
#  it 'unshift.', ->
