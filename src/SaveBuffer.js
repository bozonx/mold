import _ from 'lodash';

import { findPrimary, getSchemaBaseType } from './helpers';

export default class SaveBuffer {
  constructor(main, storage) {
    this._addedUnsavedItems = {};
    this._removedUnsavedItems = {};
  }

  // TODO: если удалять добавленные не сохраненные элементы, если был запрос удаления

  getAdded() {
    // TODO: запрашивать только элементы по определенному пути
    return this._addedUnsavedItems;
  }

  getRemoved() {
    return this._removedUnsavedItems;
  }

  /**
   * Add item to collection of unsaved added items .
   * @param {string} pathToCollection
   * @param {object} item
   */
  addUnsavedAddedItem(pathToCollection, item) {
    if (!this._addedUnsavedItems[pathToCollection])
      this._addedUnsavedItems[pathToCollection] = [];

    this._addedUnsavedItems[pathToCollection].push(item);
  }

  /**
   * Add item to collection unsaved removed items.
   * @param {string} pathToCollection
   * @param {object} item
   */
  addUnsavedRemovedItem(pathToCollection, item) {
    if (!this._removedUnsavedItems[pathToCollection])
      this._removedUnsavedItems[pathToCollection] = [];

    this._removedUnsavedItems[pathToCollection].push(item);
  }


}
