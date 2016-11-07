// Paged collection

import _PagedCollectionBase from './_PagedCollectionBase';

export default class PagedCollection extends _PagedCollectionBase {
  constructor(main) {
    super(main);
  }

  get type() {
    return 'pagedCollection';
  }

  $init(root) {
    super.$init(root);
  }

  /**
   * Set page to mold.
   * It doesn't mark items as unsaved.
   * @param {Array} page
   * @param {number|undefined} pageNum
   */
  setPage(page, pageNum) {
    super.$setPage(page, pageNum);
  }

  /**
   * Remove page
   * @param {number} pageNum
   */
  removePage(pageNum) {
    // TODO: test it
    super.$removePage(pageNum);
  }
}
