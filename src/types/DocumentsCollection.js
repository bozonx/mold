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

  /**
   * add item to the end of last page.
   * It creates new page if last page was overflowed.
   *
   * It add item to save buffer. It's saving after calling save().
   */
  addItem(item) {
    super.addItem(main);

    // TODO: add save buffer request - но не в инстансе
  }

  batchAdd() {
    // TODO: !!!!
    // TODO: !!!!
  }

  batchRemove() {
    // TODO: !!!!
    // TODO: можно удалять даже не загруженные элементы
  }

  // TODO: setPage - тут не нужет, вместо него будет load
  // TODO: removePage - тоже не нужно наверное

  load(pageNum) {
    // TODO: !!!!
  }

  save() {
    // TODO: !!!!
  }

}
