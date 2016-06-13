class LocalLocalStorage {
  constructor(mainInstatnce, localConfig) {
    this._mainInstatnce = mainInstatnce;
    this._localConfig = localConfig;
  }

  /**
   * It runs on schema init.
   * @param {string} root - absolute root in main schema
   * @param {object} schemaManager
   * @param {object} state
   * @param {object} events
   */
  init(root, schemaManager, state, events) {
    this.root = root;
    this._schemaManager = schemaManager;
    this._state = state;
    this._events = events;

    // TODO: Does it need a main events object?

    // Listen all data manipulation events
    // this._events.on('data', (event) => {
    //   if (event.method == 'set') {
    //     // ...
    //   }
    // })
  }
}

export default class LocalStorage {
  constructor(mainConfig) {
    this.mainConfig = mainConfig;
  }

  /**
   * Schema helper
   * @param {object} localConfig
   * @param {object} schema
   * @returns {{driver: LocalLocalStorage, schema: *}}
   */
  schema(localConfig, schema) {
    return {
      driver: new LocalLocalStorage(this, localConfig),
      schema: schema,
    }
  }
}
// TODO: do it
