import _ from 'lodash';

import { concatPath } from '../helpers';
import _PagedCollectionBase from './_PagedCollectionBase';


export default class DocumentsCollection extends _PagedCollectionBase{
  constructor(main) {
    super(main);
  }

  get type() {
    return 'documentsCollection';
  }

  $init(root, schema) {
    super.$init(root, schema);
  }

  load() {

  }

  save() {

  }

}
