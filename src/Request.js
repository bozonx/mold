
export default class Request {
  constructor(main) {
    this._main = main;
  }
  
  generate(type, fullPath, data) {
    var documentParams = this._main.schemaManager.getDocument(fullPath);
    var request = {
      type,
      fullPath,
      data,
    };

    if (documentParams) {
      // If we want set all document
      let document = request.data;

      // If we want set one value to document
      let pathToValue = _.trim(request.fullPath.split(documentParams.pathToDocument)[1], '.');
      if (pathToValue)
        document = _.set({}, pathToValue, request.data);

      request = {
        ...request,
        pathToValue,
        documentParams,
        document,
        pathToDocument: documentParams.pathToDocument,
      };
    }

    console.log(request)

    return request;
  }
}
