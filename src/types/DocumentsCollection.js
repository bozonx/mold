import _ from 'lodash';

import { concatPath } from '../helpers';
import PagedCollection from './PagedCollection';


export default class DocumentsCollection extends PagedCollection{
  constructor(main) {
    super(main);

    this.type = 'documentsCollection';
  }

  $init(root, schema) {
    super.$init(root, schema);
  }

}
