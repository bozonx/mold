import _ from 'lodash';

export default class Request {
  constructor(main) {
    this._main = main;
  }

  generate(type, fullPath, data) {
    var documentParams = this._main.schemaManager.getDocument(fullPath);
    var preRequest = {
      type,
      fullPath,
      data,
      documentParams,
    };

    return this['_generateFor_' + preRequest.type](preRequest);
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
    let document = request.data;

    // If we want set one value to document
    let pathToField = this._getPathToField(request);
    if (pathToField)
      document = _.set({}, pathToField, request.data);

    return {
      ...request,
      pathToField,
      document,
      pathToDocument: request.documentParams.pathToDocument,
    };
  }

  _getPathToField(request) {
    return _.trim(request.fullPath.split(request.documentParams.pathToDocument)[1], '.');
  }
}
