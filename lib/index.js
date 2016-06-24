'use strict';

const filterChain = require('@digitaledgeit/filter-chain');
const Validator = require('@digitaledgeit/validator-chain');
let promises = [];

const applyFilterToField = (chain, value) => new Promise((resolve) => {
  chain.filter(value, filteredValue => {
    resolve(filteredValue);
  });
});

const isEmpty = (value) => {
  return (typeof value === 'undefined') || value === null || value === '';
};

function createValidator(rules) {
  const validator = new Validator();
  rules.forEach(rule => {
    validator.add.apply(validator, rule);
  });
  return validator;
}

function validate(validators, filteredValue) {
  const validator = createValidator(validators);
  return new Promise((resolve, reject) => {
    validator.validate(filteredValue, (err, valid, ctx) => {
      if (err) return reject(err);
      resolve({valid, validValue: filteredValue, error: ctx});
    });
  });
}

function createValidations(path, schema, values) {
  const schemaKeys = Object.keys(schema);
  schemaKeys.map(key => {
    const schemaItem = schema[key];
    const value = values[key];

    let nestedKey = key;
    if (path !== null) {
      nestedKey = `${path}.${key}`;
    }

    const validateThing = valueToValidate => {
      return validate(schemaItem.validators, valueToValidate).then(result => {
        result.key = nestedKey;
        return result;
      });
    };

    if (isEmpty(value)) {
      if ((typeof schemaItem.empty === 'undefined') || (typeof schemaItem.empty.default === 'undefined')) {
        throw Error(`No default set for ${key}`);
      } else {
        promises.push(Promise.resolve({key: nestedKey, valid: true, validValue: schemaItem.empty.default}));
      }
    } else if (typeof schemaItem.filters !== 'undefined' && schemaItem.filters.length > 0) {
      const chain = filterChain(schemaItem.filters);
      promises.push(applyFilterToField(chain, value).then(filteredValue => (validateThing(filteredValue))));
    } else {
      if (schemaItem.children) {
        createValidations(nestedKey, schemaItem.children, value);
      } else {
        promises.push(validateThing(value));
      }
    }
  });
}

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

function validateAgainstSchema(schema, values) {
  promises = [];
  createValidations(null, schema, values);
  return runValidations();
}

module.exports = {
  validate: validateAgainstSchema
};
