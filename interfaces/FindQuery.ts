export interface FindQuery {
  // page number. Starts from 1
  page?: number;
  // items per page
  pageSize?: number;
  [index: string]: any;
}
