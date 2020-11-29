# Mold


## Hooks Middleware

To prevent processing further hooks just throw new Error().
Code can be http status or some other code.
Message is optional.


## Debug

    $mold.doRequest({set: 'mySet', action: 'find'})
    $mold.props.backends.default.doAdapterRequest({set: 'mySet', action: 'find', query: {}})
    // pouchDb instance
    $mold.props.backends.default.adapter.db
