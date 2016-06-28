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

    return this['_generateFor_' + req.method](req);
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

    let pathToField = this._getPathToField(request);

    return {
      ...request,
      pathToField,
      pathToDocument: request.documentParams.pathToDocument,
    };
  }

  _generateFor_add(request) {
    if (!request.documentParams) return request;

    return {
      ...request,
      pathToDocument: request.documentParams.pathToDocument,
    };
  }

  _generateFor_remove(request) {
    if (!request.documentParams) return request;

    return {
      ...request,
      pathToDocument: request.documentParams.pathToDocument,
    };
  }

  _getPathToField(request) {
    return _.trim(request.fullPath.split(request.documentParams.pathToDocument)[1], '.');
  }
}
