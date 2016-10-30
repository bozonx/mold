import _ from 'lodash';

import { concatPath } from '../helpers';
import Container from './Container';


export default class Document extends Container{
  constructor(main) {
    super(main);

    this.type = 'document';
  }

  $init(root, schema) {
    super.$init(root, schema);
  }

}
