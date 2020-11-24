export type MoldSchemaFieldType = 'string'
  | 'text'
  | 'number'
  | 'boolean';


export interface MoldSchemaField {
  type: MoldSchemaFieldType;
  unique?: boolean;
  required?: boolean;
  length?: number;
  relation: string;
}

export interface MoldSchemaSet {
  set: string;
  fields: Record<string, MoldSchemaField>;
  seed: Record<string, any>[];
}

export interface MoldSchema {
  [index: string]: MoldSchemaSet;
}
