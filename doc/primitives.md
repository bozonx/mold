# Primitives

Primitives are part of document of item of catalogue.

## Common features

* Schema of primitive has to have a "type" parameter points on primitive type
* Schema can has an initial param which contain initial value


### String, number, boolean

    {
      stringParam: { type: 'string', initial: 'value' },
      numberParam: { type: 'number', initial: 5 },
      booleanParam: { type: 'boolean', initial: true },
    }
    
### Array

Array has to have an "item" param which points to type of items of array.

#### Simple array

    {
      arrayParam: {
        type: 'array',
        initial: [ 1, 2, 3 ],
        item: 'number',
      }
    }
    
    
#### Nested array

For nested arrays you have to put schema of array to "item" param.
This schema has to not include an "initial" param.

    {
      arrayParam: {
        type: 'array',
        initial: [ [1], [2] ],
        item: {
          type: 'array',
        },
      }
    }
    