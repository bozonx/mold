// Try to not to use null because it is a bad way.
export type Primitives = string | number | boolean | null;
export type JsonTypes = Primitives | Primitives[] | {[index: string]: Primitives};
export type Dictionary = {[index: string]: JsonTypes | undefined};
