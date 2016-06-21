import _ from 'lodash';

export default class Request {
  constructor(main) {
    this._main = main;
  }

  generate(preRequest) {
    var documentParams = this._main.schemaManager.getDocument(preRequest.fullPath);
    var req = {
      ...preRequest,
      documentParams,
    };

    return this['_generateFor_' + req.type](req);
  }

  _generateFor_get(request) {
    if (!request.documentParams) return request;

    let pathToField = this._getPathToField(request);

    return {
      ...request,
      pathToField,
      pathToDocument: request.documentParams.pathToDocument,
    };
  }

  _generateFor_set(request) {
    if (!request.documentParams) return request;

    // If we want set all the document
    let document = request.payload;

    // If we want set one value to document
    let pathToField = this._getPathToField(request);
    if (pathToField)
      document = _.set({}, pathToField, request.payload);

    return {
      ...request,
      pathToField,
      document,
      pathToDocument: request.documentParams.pathToDocument,
    };
  }

  _generateFor_add(request) {
    if (!request.documentParams) return request;

    let document = request.payload;

    return {
      ...request,
      document,
      pathToDocument: request.documentParams.pathToDocument,
    };
  }

  // TODO: remove, find, filter

  _getPathToField(request) {
    return _.trim(request.fullPath.split(request.documentParams.pathToDocument)[1], '.');
  }
}
