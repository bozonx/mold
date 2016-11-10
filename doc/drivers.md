# Drivers

Features

* Drivers serves request only for containers or collections, not for primitives. 

## Driver methods

### get

receive

* payload - additional params for request
* ... all other

returns

* return promise with generated response
* response data placed in 'body' param

### set

receive

* payload - data to set, it's a container
* ... all other

returns

* return promise with generated response
* response data placed in 'body' param. It must be a correct data to set to storage


## Request format
State manager generate request like:

* method - one of: get, set, filter, add, remove
* payload - Data to save. There is different data for different methods
* schemaBaseType - primitive|container|collection
* moldPath - path in state and schema
* document
  * pathToDocument - It's path to document defined in schema.
           It will be unefined, if document isn't defined in schema.
  * ... - parameters of document from schema
* driverPath
  * document - path to document in schema
  * full - full request path: base + sub. Usually it's like moldPath
  * base - path to container or collection. Usually it's path to document.
  * sub - path to container or collection child

Driver path example:

* full - path.to.collection.0.primitive
* base - path.to.collection
* sub - 0.primitive


## Response format

* request - It's a request parameters.
* worked - It's worked data for inserting to mold
* driverResponse - It's raw data from server
* driverError - It's raw error from server
