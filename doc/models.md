# Models

## In schema

    rootContainer: {
      model1: {
        type: 'model',
        url: '/path/to/api',
        method: 'GET',
        // ... other params for your model
        schema: {
          stringParam: { type: 'string' },
          numberParam: { type: 'number' },
        },
      },
      model2: apiGet('/path/to/api', {
        stringParam: { type: 'string' },
        numberParam: { type: 'number' },
      }),
    },


When we request one of model children or model itself then only model path passed to driver.
