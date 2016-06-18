# Common usage

TODO: !!! прописать про списки
TODO: !!! прописать про инициализацию в приложении

Prepare

    var container = mold.instance('path.to.container');

## Bind to template
You can bind any value from schema even data haven't loaded.

    container.mold.path.to;
    container.child('relative.path.to.param').mold;


## Request for data

After request will finish, the data will set up to mold and your code in promise will executed.

    container.get('relative.path.to.param').then((response) => {
      // ... your code.
    });
    container.child('relative.path.to.param').get();


## Set
By default at once with run "set" method, a new value will set up to mold.

    container.set('path.to', 'new value').then(...);
    container.child('relative.path.to.param').set('new value').then(...);
