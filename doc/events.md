# Events

## Mold update event

On each change of primitives or add or remove item from collections,
mold rises 'change' event.

Event has next params:

* path - it's path to primitive or collection
* action - one of "change", "add", "remove"

If you change container partly, another params rise "unchanged" event


## Watch

* "watch" is watching for changes and run callback on each.
* it watches deeply. For watch only changing of collection size, use "watchOnly" method of collection
* on add or remove item from collection it rises only "add" or "remove" events on collection.
    It doesn't rise any events of primitives in item.

watch callback accept next parameters:

* newValue
* oldValue
* action
* path
