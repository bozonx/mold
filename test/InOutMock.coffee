path = require('path');
mock = require('mock-require');
_ = require('lodash');

global.ioMock = {}
mock('src/InOut', ioMock)

ioModulePath = 'src/InOut'
InOutMockInitial = {
  execCmd: (cmd) ->
    return {
      code: 0
    }

  exit: (code) ->
    return undefined

  ln: (args, source, dest) ->
    return undefined

  mkdir: (args, path) ->
    return undefined

  test: (args, path) ->
    return true

  rm: (args, path) ->
    return undefined

  prompt: (prompt) ->
    return 'y'

  symlink: (source, dest) ->
    return undefined

  which: (executable) ->
    return true
};

# Extend Io mock with you mock
global.__setIoMock = (mock) ->
  _.extend(ioMock, mock)

# Reset to defaults
global.__resetIoMock = () ->
  global.__setIoMock(_.clone(InOutMockInitial))

# Reset to defaults
global.__stopIoMock = () ->
  mock.stop(ioModulePath)

# set default mock on startup
global.__resetIoMock()
