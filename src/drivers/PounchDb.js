var PouchDB = require('pouchdb');

var remoteCouch = false;

export default class eee {
  constructor(state, schemaManager) {
    db.changes({
      since: 'now',
      live: true
    }).on('change', this.showTodos);
  }

  requestHandler(event, next, error) {
    next(event);    
  }


  checkboxChanged(todo, event) {
    todo.completed = event.target.checked;
    db.put(todo);
  }

  deleteButtonPressed(todo) {
    db.remove(todo);
  }

  showTodos() {
    db.allDocs({include_docs: true, descending: true}, function(err, doc) {
      redrawTodosUI(doc.rows);
    });
  }

  addTodo(text) {
    var todo = {
      _id: new Date().toISOString(),
      title: text,
      completed: false
    };
    db.put(todo, function callback(err, result) {
      if (!err) {
        console.log('Successfully posted a todo!');
      }
    });
  }

}


class LocalPounchDb {
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
    this._root = root;
    this._schemaManager = schemaManager;
    this._state = state;
    this._events = events;

    // TODO: Does it need a main events object?

    // Listen all data manipulation events
    this._events.on('data', (event) => {
      if (event.method == 'set') {
        // ...
      }
    })
  }
}

export default class PounchDb {
  constructor(mainConfig) {
    this.mainConfig = mainConfig;
    this.db = new PouchDB('myDB', {db: require('memdown')});
  }

  /**
   * Schema helper
   * @param {object} localConfig
   * @param {object} schema
   * @returns {{driver: LocalInstance, schema: *}}
     */
  schema(localConfig, schema) {
    return {
      driver: new LocalPounchDb(this, localConfig),
      schema: schema,
    }
  }
}
