import _ from 'lodash';

import { concatPath, convertFromLodashToSchema } from '../helpers';
import _TypeBase from './_TypeBase';


export default class Container extends _TypeBase {
  static validateSchema(schema, schemaPath) {
    // TODO: нельзя вкладывать простые типы
    // if (!_.isPlainObject(schema.schema))
    //   return `Schema definition of container on "${schemaPath}" must have a "schema" param!`;
  }

  constructor(main) {
    super(main);
  }

  get type() {
    return 'container';
  }

  $init(paths, schema) {
    super.$init(paths, schema);
  }

}
