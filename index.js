'use strict';
const validatorChain = require('@digitaledgeit/validator-chain');

function createValidator(rules) {
  const validator = validatorChain();
  rules.forEach(rule => {
    validator.add(rule[0], rule[1]);
  });
  return validator;
}

function validate(schema, values) {
  let allValid = true;
  const errors = {};

  const results = Object.keys(schema).map(field => {

    const validator = createValidator(schema[field]);

    return new Promise((resolve, reject) => {
      validator.validate(values[field], function(err, valid, ctx) {
        if (err) return reject(err);
        if (!valid) {
          errors[field] = ctx;
        }
        allValid = allValid && valid;
        resolve();
      });
    });
  });

  return Promise.all(results).then(() => {
    return {valid: allValid, errors};
  });
}

module.exports.validate = validate;
