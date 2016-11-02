// Paged collection

import _PagedCollectionBase from './_PagedCollectionBase';

export default class PagedCollection extends _PagedCollectionBase {
  constructor(main) {
    super(main);
  }

  get type() {
    return 'pagedCollection';
  }

  $init(root, schema) {
    super.$init(root, schema);
  }
}
