// Try to not to use null because it is a bad way.
export type Primitives = string | number | boolean | null | undefined;
export type JsonTypes = Primitives | Primitives[] | {[index: string]: JsonTypes};
export type Dictionary = {[index: string]: JsonTypes | undefined};
export type JsonData = Primitives[] | Dictionary;
