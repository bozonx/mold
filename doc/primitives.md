# Primitives

Primitives are part of document of item of catalogue.

## Common features

* Schema of primitive has to have a "type" parameter points on primitive type
* Schema can has an initial param which contain initial value
* if you don't specify a schema of primitive, it value of document or item of catalogue
  will not be validated, but you can use it value.
* you can use undefined or null instead value of all the types.
* when you set a new value mold validate it and tries cast value
  e.g. '10' casts to 10 if number uses, 'false' casts to false, 10 casts to '10' if string uses etc. 


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
    
#### Collection

    {
      arrayParam: {
        type: 'array',
        initial: [ {id: 1}, {id:2} ],
        item: {
          type: 'assoc',
          items: {
            param: { type: 'number' }
          },
        },
      }
    }
    

### Assoc

    {
      assocParam: {
        type: 'assoc',
        initial: { id: 1 }
        items: {
          stringParam: { type: 'string' },
          numberParam: { type: 'number' },
          booleanParam: { type: 'boolean' },
          arrayParam: { type: 'array', item: 'number', initial: [ 1, 2 ] }
          assocParam: { type: 'assoc', items: {
            subParam: { type: 'string', initial: 'str' }
          },
        },
      }
    }
