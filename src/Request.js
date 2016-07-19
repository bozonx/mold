import _ from 'lodash';

export default class Request {
  constructor(main) {
    this._main = main;
  }

  generate(preRequest) {
    var documentParams = this._main.schemaManager.getDocument(preRequest.fullPath);
    var req = {
      ...preRequest,
    };

    if (documentParams) req['documentParams'] = documentParams;

    return this['_generateFor_' + req.method](req);
  }

  _generateFor_get(request) {
    // TODO: зачем???
    if (!request.documentParams) return request;

    //let pathToField = this._getPathToField(request);

    return {
      ...request,
      //pathToField: pathToField || undefined,
      pathToDocument: request.documentParams.pathToDocument,
    };
  }

  _generateFor_filter(request) {
    // TODO: зачем???
    if (!request.documentParams) return request;

    //let pathToField = this._getPathToField(request);

    return {
      ...request,
      //pathToField: pathToField || undefined,
      pathToDocument: request.documentParams.pathToDocument,
    };
  }


  _generateFor_set(request) {
    // TODO: зачем???
    if (!request.documentParams) return request;

    //let pathToField = this._getPathToField(request);

    return {
      ...request,
      //pathToField: pathToField || undefined,
      pathToDocument: request.documentParams.pathToDocument,
    };
  }

  _generateFor_add(request) {
    // TODO: зачем???
    if (!request.documentParams) return request;

    return {
      ...request,
      pathToDocument: request.documentParams.pathToDocument,
    };
  }

  _generateFor_remove(request) {
    // TODO: зачем???
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
