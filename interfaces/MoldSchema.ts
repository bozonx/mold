import {JsonTypes} from './Types';

export type MoldSchemaFieldType = 'string'
  | 'text'
  | 'number'
  | 'boolean'
  | 'timestamp';


export interface MoldSchemaField {
  type: MoldSchemaFieldType;
  default?: JsonTypes;
  unique?: boolean;
  required?: boolean;
  length?: number;
  relation?: string;
}

export interface MoldSchemaSet {
  //set: string;
  fields: Record<string, MoldSchemaField>;
  seed?: Record<string, any>[];
}

export interface MoldSchema {
  [index: string]: MoldSchemaSet;
}
