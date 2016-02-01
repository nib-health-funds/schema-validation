'use strict';

const filterChain = require('@digitaledgeit/filter-chain');
const Validator = require('@digitaledgeit/validator-chain');

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

const validate = (validators, filteredValue) => {
  
  const validator = createValidator(validators);
    
  return new Promise((resolve, reject) => {
    validator.validate(filteredValue, (err, valid, ctx) => {
      if (err) return reject(err);
      resolve({valid, validValue: filteredValue, error: ctx});
    });
  });
};

module.exports = {

  /**
   * Validate all the fields, even where values are not provided.
   * @param   {object} schemaFilters - filters to apply to values, eg. remove whitespace
   * @param   {object} schemaValitationRules - validation rules
   * @param   {object} values - object/values to apply filtering and validation to
   * @returns {Promise<{valid: boolean, values: object  errors: object}>}
   */
  validate: (schema, values) => {
    
    const schemaKeys = Object.keys(schema);
    
    const promises = schemaKeys.map(key => {
      const schemaItem = schema[key];
      const value = values[key]; 
      
      const validateThing = valueToValidate => {
        return validate(schemaItem.validators, valueToValidate).then(result => {
          result.key = key;
          return result;
        });
      };
      
      if (isEmpty(value)) {
        if ((typeof schemaItem.empty === 'undefined') || (typeof schemaItem.empty.default === 'undefined')) {
          // ERR
          throw Error(`No default set for ${key}`);
        } else {
          // default
          return Promise.resolve({key, valid: true, validValue: schemaItem.empty.default});
        }
      } else if (typeof schemaItem.filters !== 'undefined' && schemaItem.filters.length > 0) {
          // filter
        const chain = filterChain(schemaItem.filters);

          // validate filtered value
        return applyFilterToField(chain, value).then(filteredValue => (validateThing(filteredValue))); 
      } else {
          // validate value
        return validateThing(value);
      }
    });
    
    return Promise.all(promises).then(results => {
    
      let allValid = true;
      const errors = {};
      const validValues = {};

      results.forEach(result => {
        if (result.valid) {
          validValues[result.key] = result.validValue;
        } else {
          errors[result.key] = result.error;
        }
        
        allValid = allValid && result.valid;
      });

      return {valid: allValid, values: validValues, errors};
    });
  }
};
