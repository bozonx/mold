import Main from './Main';


export default function(userSchema, config) {
  const $main = new Main(userSchema, config);

  // public api
  return {
    $main,

    /**
     * Get real storage. Use it only for binding to frameworks.
     * For other ways use exportStorage.
     * @returns {object} - whole storage
     */
    $getWholeStorageState() {
      return $main.$$storage.$getWholeStorageState();
    },

    /**
     * Set storage data. Only for test or dev purposes.
     * @param {object} newStorage - your storage
     */
    $setWholeStorageState(newStorage) {
      $main.$$storage.$init(newStorage);
    },

    /**
     * Export storage
     * @returns {object} - Whole storage
     */
    exportStorage() {
      return _.cloneDeep($main.$$storage.$getWholeStorageState());
    },

    /**
     * Get instance of type by schema path.
     * @param {string} moldPath - absolute mold path in schema
     * @returns {object} requested node instance
     */
    get(moldPath) {
      return $main.$$nodeManager.getInstance(moldPath);
    },

    /**
     * Get driver by moldPath in schema.
     * You cat pass path deeper than certain driver path.
     * If no one driver has found it returns a default driver (memory)
     * @param {string} moldPath - absolute mold path in schema
     * @returns {object|undefined} - Driver of undefined if it hasn't found.
     */
    getDriver(moldPath) {
      return $main.driverManager.getDriver(moldPath);
    },

    /**
     * Listen to all the changes made by user.
     * @param {function} handler - event handler
     */
    onChange(handler) {
      $main.$$storage.onChange(handler);
    },

    /**
     * Listen to all the changes silent or by user.
     * Don't use it in common purpose. It's only usual for application or component inner state updates.
     * @param {function} handler - event handler
     */
    onAnyChange(handler) {
      $main.$$storage.onAnyChange(handler);
    },

    off(handler) {
      $main.$$storage.off(handler);
    },

    setNode(moldPath, schema) {
      $main.$$schemaManager.setNode(moldPath, schema);
    },

  };
}
