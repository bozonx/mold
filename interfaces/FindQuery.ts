export interface FindQuery {
  // page number. Starts from 1
  page?: number;
  // items per page
  perPage?: number;
  [index: string]: any;
}
