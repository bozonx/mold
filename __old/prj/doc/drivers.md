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
* nodeType - primitive|container|collection
* moldPath - path in state and schema

Driver path example:

* full - path.to.collection.0.primitive
* base - path.to.collection
* sub - 0.primitive


## Response format

* request - It's a request parameters.
* worked - It's worked data for inserting to mold
* driverResponse - It's raw data from server
* driverError - It's raw error from server
