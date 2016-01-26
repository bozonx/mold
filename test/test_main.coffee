_ = require('lodash')

window.getMock = (instance, fakeVars) ->
  _.each fakeVars, (value, name) ->
    instance.__set__(name, value);
  return instance
