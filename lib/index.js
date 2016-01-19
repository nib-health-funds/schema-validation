var FilterChain = require('@digitaledgeit/filter-chain');
var Validator = require('@digitaledgeit/validator-chain');

var applyFilters = function (schemaFilters, values) {
  return new Promise((resolve, reject) => {
    if (schemaFilters && Object.keys(schemaFilters).length > 0) {
      Object.keys(schemaFilters).map(function (filterField) {
        var chain = FilterChain(schemaFilters[filterField]);
        if (values[filterField]) {
          chain.filter(values[filterField], function (filteredValue) {
            values[filterField] = filteredValue;
            resolve(values);
          })
        }
      });
    } else {
      resolve(values);  
    }
  })
}

function createValidator(rules) {
  var validator = new Validator();
  rules.forEach(function (rule) {
    validator.add.apply(validator, rule);
  });
  return validator;
}

var validateAll = function (schemaValidationRules, filteredValues) {
  return Object.keys(schemaValidationRules).map(function (field) {
    var validator = createValidator(schemaValidationRules[field]);
    return new Promise((resolve, reject) => {
      validator.validate(filteredValues[field], function (err, valid, ctx) {
        if (err) return reject(err);
        resolve({ field, valid, validValue: filteredValues[field], error: ctx });
      });
    });
  });
}

module.exports = {

  /**
   * Validate all the fields, even where values are not provided.
   * @param   {object} schemaFilters - filters to apply to values, eg. remove whitespace
   * @param   {object} schemaValitationRules - validation rules
   * @param   {object} values - object/values to apply filtering and validation to
   * @returns {Promise<{valid: boolean, errors: object}>}
   */
  all: function validate(schemaFilters, schemaValidationRules, values) {
    var allValid = true;
    var errors = {};
    var validValues = {};

    return applyFilters(schemaFilters, values).then((filteredValues) => {
      return Promise.all(validateAll(schemaValidationRules, filteredValues)).then((validationResults) => {

        validationResults.forEach(result => {
          if (result.valid) {
            validValues[result.field] = result.validValue;
          } else {
            errors[result.field] = result.error;
          }

          allValid = allValid && result.valid;
        })

        return { valid: allValid, values: validValues, errors: errors };
      });
    });
  },

  /**
   * Validate only the fields where a value was provided.
   * @param   {object} schema
   * @param   {object} values
   * @returns {Promise<{valid: boolean, values: object, errors: object}>}
   */
  partial: function partial(schema, values) {

    var allValid = true;
    var errors = {};
    var validValues = {};

    var results = Object.keys(values).map(function (field) {
      var validator = createValidator(schema[field]);
      return new Promise(function (resolve, reject) {
        validator.validate(values[field], function (err, valid, ctx) {
          if (err) return reject(err);

          if (valid) {
            validValues[field] = values[field];
          } else {
            errors[field] = ctx;
          }

          allValid = allValid && valid;

          resolve();
        });
      });
    });

    return Promise.all(results).then(function () {
      return { valid: allValid, values: validValues, errors: errors };
    });

  }

};
