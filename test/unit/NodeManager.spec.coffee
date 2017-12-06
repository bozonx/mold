NodeManager = require('../../src/NodeManager').default


describe 'Unit. NodeManager.', ->
  beforeEach () ->
    @main = {
      $$log: {
        fatal: (err) -> throw new Error(err)
      }
    }

    testSchema = () =>
      {
      }

    @testSchema = testSchema()
    @nodeManager = new NodeManager(@main);

  it "", ->


# TODO: check bad schema - not valid node
# TODO: check bad schema - not valid primitive
