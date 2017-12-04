import _ from 'lodash';

import { isCollection } from '../helpers/helpers';


export default class CollectionType {
  constructor() {

  }

  getInitial() {
    return [];
  }

  validate(value) {
    return isCollection(value);
  }

}
