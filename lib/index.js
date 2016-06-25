'use strict';

const filterChain = require('@digitaledgeit/filter-chain');
const Validator = require('@digitaledgeit/validator-chain');
let promises = [];

const applyFilterToField = (chain, value) => new Promise((resolve) => {
  chain.filter(value, filteredValue => {
    resolve(filteredValue);
  });
});

const isEmpty = (value) =>
  (typeof value === 'undefined') || value === null || value === '';

/**
 * Turn a collection of validation rules into a validator chain.
 * @param {object} rules Nested parent key of object. e.g. "outerKey.innerKey".
 * @returns {object} A validator chain
 */
function createValidator(rules) {
  const validator = new Validator();
  rules.forEach(rule => {
    validator.add.apply(validator, rule);
  });
  return validator;
}

/**
 * Turn a collection of validation rules and a filtered value into a promise
 * @param {object} validators A collection of validation rules
 * @param {object} filteredValue A filtered value
 * @returns {object} A promise wrapping a validator chain
 */
function validate(validators, filteredValue) {
  const validator = createValidator(validators);
  return new Promise((resolve, reject) => {
    validator.validate(filteredValue, (err, valid, ctx) => {
      if (err) return reject(err);
      resolve({valid, validValue: filteredValue, error: ctx});
    });
  });
}

/**
 * Parse the values object and map validation rules to each field.
 * @param {string} path Nested parent key of object. e.g. "outerKey.innerKey".
 * @param {object} schema Object describing the schema to validate against.
 * @param {object} values Object which is validated against the schema.
 * @returns {void}
 */
function createValidations(path, schema, values) {
  const schemaKeys = Object.keys(schema);
  schemaKeys.map(key => {
    const schemaItem = schema[key];
    const value = values[key];

    let nestedKey = key;
    if (path !== null) {
      nestedKey = `${path}.${key}`;
    }

    const validateThing = valueToValidate =>
      validate(schemaItem.validators, valueToValidate).then(result => {
        result.key = nestedKey;
        return result;
      });

    if (isEmpty(value)) {
      if ((typeof schemaItem.empty === 'undefined') || (typeof schemaItem.empty.default === 'undefined')) {
        throw Error(`No default set for ${key}`);
      } else {
        promises.push(Promise.resolve({key: nestedKey, valid: true, validValue: schemaItem.empty.default}));
      }
    } else if (typeof schemaItem.filters !== 'undefined' && schemaItem.filters.length > 0) {
      const chain = filterChain(schemaItem.filters);
      promises.push(applyFilterToField(chain, value).then(filteredValue => (validateThing(filteredValue))));
    } else if (schemaItem.children) {
      createValidations(nestedKey, schemaItem.children, value);
    } else {
      promises.push(validateThing(value));
    }
  });
}

/**
 * Adds a value with a nested key (dot notation) to an object, creating
 * sub-objects as necessary
 * @param {object} obj Object to which the key is added.
 * @param {string} nestedKey A key using "dot" notation. e.g. "outerkey.innerkey"
 * @param {object} value Could be a string or a hash.
 * @returns {void}
 */
function addNestedValue(obj, nestedKey, value) {
  const path = nestedKey.split('.');

  let o = obj;
  for (let i = 0; i < path.length - 1; ++i) {
    const key = path[i];
    if (!(key in o)) {
      o[key] = {};
    }
    o = o[key];
  }

  const lastKey = path[path.length - 1];
  o[lastKey] = value;
}

/**
 * Run all validations (which are implemented as promises) and return results
 * of the validations.
 * @returns {object} {valid: boolean, values: object, errors: object}
 */
function runValidations() {
  return Promise.all(promises).then(results => {

    let allValid = true;
    const errors = {};
    const validValues = {};

    results.forEach(result => {
      if (result.valid) {
        addNestedValue(validValues, result.key, result.validValue);
      } else {
        addNestedValue(errors, result.key, result.error);
      }
      allValid = allValid && result.valid;
    });

    return {valid: allValid, values: validValues, errors};
  });
}

/**
 * Validate an ibject against a schema
 * @param {object} schema Object describing the schema to validate against.
 * @param {object} values Object which is validated against the schema.
 * @returns {object} {valid: boolean, values: object, errors: object}
 */
function validateAgainstSchema(schema, values) {
  promises = [];
  createValidations(null, schema, values);
  return runValidations();
}

module.exports = {
  validate: validateAgainstSchema
};
