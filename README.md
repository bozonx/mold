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


### Get schema

get full schema

    mold.schema();
    
get schema by path

    mold.schema('path.to');


### Set schema

Set full schema

    mold.schema('/', mold.struct({...}));


Set schema by path

    mold.schema('path.to', mold.struct({...}));


### Get compound data (composition)

    mold.composition(path);
    
It return javascript plain object of array of composed data.
Use it for bind in templates


### Get object-wrapper

    TODO: 
    

### Set/change value

    mold.set(path, newValue);

It validate value and set it to stored data.



TODO: расписать значения по умолчанию для каждого типа