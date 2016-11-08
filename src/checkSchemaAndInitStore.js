import _ from 'lodash';

import { eachSchema } from './helpers';

// TODO: разъединить в отдельные ф-и

/**
 * It inits and validate the schema.
 * @class
 */
export default function(rawSchema) {
  var initialStorage = {};


  // Init storage. Collection's init behavior if different than in schema init.
  eachSchema(rawSchema, (path, value) => {
    //  convert from schema to lodash
    var moldPath = path.replace(/\.schema/g, '');
    if (value.type == 'document') {
      _.set(initialStorage, moldPath, {});

      // Go through inner param 'schema'
      //return 'schema';
    }
    else if (value.type == 'container') {
      _.set(initialStorage, moldPath, {});

      // Go through inner param 'schema'
      //return 'schema';
    }
    else if (value.type == 'documentsCollection') {
      _.set(initialStorage, moldPath, []);

      // don't go deeper
      return false;
    }
    else if (value.type == 'pagedCollection') {
      _.set(initialStorage, moldPath, []);

      // don't go deeper
      return false;
    }
    else if (value.type == 'collection') {
      _.set(initialStorage, moldPath, []);

      // don't go deeper
      return false;
    }
    else if (value.type == 'array') {
      _.set(initialStorage, moldPath, []);

      // don't go deeper
      return false;
    }
    else if (_.includes(['boolean', 'string', 'number'], value.type)) {
      _.set(initialStorage, moldPath, null);

      // don't go deeper
      return false;
    }
  });

  return { initialStorage };
}
