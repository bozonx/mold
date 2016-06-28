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
* response data placed in 'coocked' param

### set

receive

* payload - data to set, it's a container
* ... all other

returns

* return promise with generated response
* response data placed in 'coocked' param. It must be a correct data to set to composition


## Request format
State manager generate request like:

* method - one of: get, set, add, remove
* payload - There is different data for different methods
* fullPath - fullPath to requested param
* documentParams - parameters of document from schema if document uses in schema
* pathToDocument - It's part of fullPath to document container or collection.
                   If in schema doesn't use document, it will be unefined.
* pathToField - It's part of fullPath to item or field in document/
                If in schema doesn't use document, it will be unefined.

## Response format

* coocked - It's prepared data to insert to composition
* successResponse - It's raw data from server
* error - It's raw error from server
* request - there is link to request
