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
   * Get instance root
   * @returns {string}
   */
  getRoot() {
    return '' + this._root;
  }

  /**
   * Get child
   * @param {string} path - path relative to this instance root
   * @returns {object} - instance of param or list or container
   */
  child(path) {
    if (!path)
      throw new Error(`You must pass a path argument.`);

    return this._schemaManager.getInstance(this._fullPath(path));
  }

  /**
   * Get filtered list
   * @param params - for parametrized query
   */
  filter(params) {
    // TODO: do it
  }

  getItem(itemFilterParams) {
    // TODO: возвращаем itemInstance и через него мы можем менять его значения

    // TODO: сделать поддержку колбэка для поиска
    // TODO: в первую очередь искать по уникальному ключу

    var value = _.find(this._state.getDirectly(this._root), itemFilterParams);
    if (_.isUndefined(value))
      throw new Error(`Can't find item by query "${JSON.stringify(itemFilterParams)}" in list "${this._root}"`);

    return value;

    // TODO: сделать чтобы возвращал instance - контейнер или элемент

    // var itemInstance = this._schemaManager.getInstance(`this._root[${itemFilterParams.id}]`);
    //
    // return itemInstance;
  }

  /**
   * Add item to list
   * @param item
   * @returns {object} promise
   */
  add(item) {
    var composition = this._state.getDirectly(this._root);
    // TODO: validate item
    composition.push(item);
    // TODO: return promise
    //return item;
    this._updateMold();
  }

  /**
   * Remove item by uniq key
   * @param item
   * @returns {object} promise
   */
  remove(item) {
    // TODO: наверное лучше искать по уникальному ключу
    _.remove(this._state.getDirectly(this._root), item)
    // TODO: return promise
    this._updateMold();
  }

  has() {
    // TODO: сделать проверку по всему списку
  }

  /**
   * Set full list silently
   */
  setSilent(list) {
    // TODO: проверить, что установятся значения для всех потомков
    this._state.setValue(this._root, list);
    this._updateMold();
  }

  /**
   * Clear full list
   */
  clear() {
    _.remove(this._state.getDirectly(this._root));
    this._updateMold();
  }

  /**
   * Reset to default for all items in list
   */
  resetToDefault() {
    // TODO: do it
    //this._state.resetToDefault(this._root);
    // TODO: reset to default - должно вызваться сброс по умолчанию у всех элементов списка
    this._updateMold();
  }

  _fullPath(relativePath) {
    return `${this._root}.${relativePath}`;
  }
  
  _updateMold() {
    this.mold = this._state.getDirectly(this._root);
  }
  
  _initComposition() {
    if (_.isUndefined(this._state.getDirectly(this._root)))
      this._state.setDirectly(this._root, []);

    return this._state.getDirectly(this._root);
  }
}
