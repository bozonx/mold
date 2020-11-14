# Document

## How it works

* все поля документа являются частью документа внезависимости от вложенности
* документ можно запрашивать до его загрузки `mold.get(path.to.document[123])`
  вернёт экземпляр документа и уже потом можно запросить метод load для загрузки данных


## In schema

    rootContainer: {
      model1: {
        document: {
          url: '/path/to/api',
          // ... other any params
        },
        schema: {
          stringParam: { type: 'string' },
          numberParam: { type: 'number' },
        },
      },
    },


When we request one of model children or model itself then only model path passed to driver.
