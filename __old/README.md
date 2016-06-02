# Mold

## Install

    nvm install
    nvm use
    npm i
    bower i


## API

To get mold, add this to you code:

    var mold = require('mold');

The `path` parameter, see in [https://lodash.com/docs#set](https://lodash.com/docs#set)


## Schema
### Get schema

get full schema

    mold.getSchema();
    
get schema by path

    mold.getSchema('path.to');


### Set schema

Set full schema

    mold.schema('/', mold.struct({...}));


Set schema by path

    mold.schema('path.to', mold.struct({...}));


### Data types
#### mold.boolean

    mold.boolean(true, {params})   // set predefined value
    mold.boolean() // use default value

Parameters:

* default - default value. By default = null

#### mold.number

    mold.number(5, {params})    // set predefined value
    mold.number() // use default value

Parameters:

* default - default value. By default = 0

#### mold.string

    mold.string('my string', {params})    // set predefined value
    mold.string() // use default value

Parameters:

* default - default value. By default = ''

#### mold.struct
Immutable structure. You can't add or remove nodes in runtime. Nodes values are only mold types.

    mold.struct({
      children1: mold.number(5)
    })



### Get compound data (composition)

    mold.composition(path);
    
It return javascript plain object or array of composed data.
Use it for bindings in templates.


### Get object-wrapper

    TODO: 
    

### Set/change value

    mold.set(path, newValue);

It validate value and set it to stored data.


## Work with instances

* To get instance, run `mold.get('path.to')`
* You can get instance for not existence schema and set schema later `myInstance.setSchema(mold.number(5))`
* Instance have some same methods with mold base object, like: getSchema, schema, composition, get and set
* You can get instance from you instance `myInstance.get('path.to.leaf')`
* Also you can use other methods, such as:
    * getRoot - get root of instance


