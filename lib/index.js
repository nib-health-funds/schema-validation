var Validator = require('@digitaledgeit/validator-chain');

function createValidator(rules) {
  var validator = new Validator();

  rules.forEach(function(rule) {
    validator.add.apply(validator, rule);
  });

  return validator;
}

module.exports = {

  /**
   * Validate all the fields, even where values are not provided.
   * @param   {object} schema
   * @param   {object} values
   * @returns {Promise<{valid: boolean, errors: object}>}
   */
  all: function validate(schema, values) {
    var allValid = true;
    var errors = {};

    var results = Object.keys(schema).map(function(field) {
      var validator = createValidator(schema[field]);
      return new Promise(function(resolve, reject) {
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

    return Promise.all(results).then(function() {
      return {valid: allValid, errors: errors};
    });
  },


  /**
   * Validate only the fields where a value was provided.
   * @param   {object} schema
   * @param   {object} values
   * @returns {Promise<{valid: boolean, errors: object}>}
   */
  partial: function partial(schema, values) {

    var allValid = true;
    var errors = {};

    var results = Object.keys(values).map(function(field) {
      var validator = createValidator(schema[field]);
      return new Promise(function(resolve, reject) {
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

    return Promise.all(results).then(function() {
      return {valid: allValid, errors: errors};
    });

  }

};
