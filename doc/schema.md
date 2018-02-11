# Schema

## Example

    export default function () {
      return {
        oneOfRootContainers: {
          nested: {
            booleanParam: { type: 'boolean' },
            stringParam: {
              type: 'string',
              default: 'default value',
            },
            numberParam: { type: 'number' },
            array: {
              type: 'array',
              item: 'string',
              default: ['first', 'second'],
            },
            collection: {
              type: 'collection',
              item: {
                id: { type: 'number' },
                name: { type: 'string' },
              },
              default: [
                {id: 1, name: 'first'},
              ],
            },
          },
        },
        OtherRootContainers: {}
      };
    }


## Types

### Containers
It just container for nested params.

### Primitives

* boolean
* string
* number

After init all of them are initializing via null. 

Their params:

* default - default value


### Array
It's just array with primitive values

Params:

* item - specify a primitive type one of: string, boolean, number, array
* default - default values


### Collection
Each element in a collection is a Object.

Params:
* item - schema for each item
* default - default values
