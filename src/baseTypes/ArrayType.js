import _ from 'lodash';

import { isSimpleArray } from '../helpers';


export default class ArrayType {
  constructor() {

  }

  validate(value) {
    if (!_.isArray(value)) return false;

    const compacted = _.compact(value);
    const head = _.head(compacted);

    if (!_.isPlainObject(head)) return true;

    return _.isUndefined(head.$$key);
  }

}
