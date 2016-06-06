import _ from 'lodash';

export default class ListInstance {
  constructor(root, schema, state, schemaManager) {
    this._root = root;
    this._state = state;
    this._schemaManager = schemaManager;
    this.schema = schema;

    // mold is just a link to the composition
    this.mold = this._initComposition();
  }
  


  /**
   * Get full list
   * @param params - for parametrized query
   */
  getList(params) {
    // TODO: do parametrized query
    return this._state.getValue(this._root);
  }

  getItem(param) {
    // TODO: возвращаем itemInstance и через него мы можем менять его значения 
  }

  /**
   * Add item to list
   * @param item
   */
  add(item) {
    // TODO: !!!
  }

  /**
   * Remove item by uniq key
   * @param item
   */
  remove(item) {
    // TODO: !!!
  }

  /**
   * Set full list
   */
  setAll(list) {
    return this._state.setValue(this._root, list);
  }

  /**
   * Clear full list
   */
  clear() {
    // TODO: !!!
  }

  _initComposition() {
    return this._state.setDirectly(this._root, []);
  }
}
