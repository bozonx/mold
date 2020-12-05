import {JsonTypes} from './Types';

export type MoldSchemaFieldType = 'string'
  | 'text'
  | 'number'
  | 'boolean'
  | 'timestamp';


export interface MoldSchemaField {
  type: MoldSchemaFieldType;
  default?: JsonTypes;
  uniq?: boolean;
  required?: boolean;
  length?: number;
  relation?: string;
}

export interface MoldSchemaIdField {
  type: 'string' | 'number',
  length: number,
  uniq: true,
}

export interface MoldSchemaSet {
  id?: MoldSchemaIdField;
  [index: string]: MoldSchemaField | undefined;
}
// object like {setName: { fieldName: MoldSchemaField }}
export type MoldSchema = Record<string, MoldSchemaSet>;
