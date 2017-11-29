import _ from 'lodash';

import { isCollection } from '../helpers';


export default class CollectionType {
  constructor() {

  }

  validate(value) {
    return isCollection(value);
  }

}
