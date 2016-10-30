import _ from 'lodash';

import { concatPath } from '../helpers';
import Collection from './Collection';


export default class DocumentsCollection extends Collection{
  constructor(main) {
    super(main);

    this.type = 'documentsCollection';
  }

  $init(root, schema) {
    super.$init(root, schema);
  }

}
