# Events

## Mold update event

On each change of primitives or add or remove item from collections,
mold rises 'mold.update' event.

Event has next params:

* path - it's path to primitive or collection
* action - one of "change", "add", "remove"


## Watch

* "watch" is watching for changes and run callback on each.
* it watches deeply. For watch only changing of collection size, use "watchOnly" method of collection

watch callback accept next parameters:

* newValue
* oldValue
* action
* path
