'use strict';

const filterChain = require('@digitaledgeit/filter-chain');
const Validator = require('@digitaledgeit/validator-chain');
const applyDefaults = require('./applyDefaults');

const applyFilterToField = (chain, value) => new Promise((resolve) => {
  chain.filter(value, filteredValue => {
    resolve(filteredValue);
  });
});

const applyFilters = (schemaFilters, values) => {

  const valueKeys = Object.keys(values);

  const schemaKeys = Object.keys(schemaFilters);

  if (schemaKeys.length === 0) {
    return valueKeys.map(key => {
      return new Promise((resolve) => {
        resolve({
          filterField: key,
          filteredValue: values[key]
        });
      });
    });
  } else {
    return valueKeys.map((filterField) => {
      if (schemaKeys.indexOf(filterField) > -1) {

        const chain = filterChain(schemaFilters[filterField]);

        return applyFilterToField(chain, values[filterField]).then(filteredValue => {
          return {filterField, filteredValue};
        });
      } else {
        return new Promise((resolve) => {
          resolve({filterField, filteredValue: values[filterField]});
        });
      }
    });
  }
};

function createValidator(rules) {
  const validator = new Validator();
  rules.forEach(rule => {
    validator.add.apply(validator, rule);
  });
  return validator;
}

const validate = (schemaValidationRules, filteredValues) => {
  
  const schemaKeys = Object.keys(schemaValidationRules);
  
  return schemaKeys.map(field => {
    
    const validator = createValidator(schemaValidationRules[field]);
    
    return new Promise((resolve, reject) => {
      validator.validate(filteredValues[field], (err, valid, ctx) => {
        if (err) return reject(err);
        resolve({field, valid, validValue: filteredValues[field], error: ctx});
      });
    });
  });
};

const createFilteredObject = filteredValues => {
  const filteredObject = {};
  filteredValues.forEach(value => {
    filteredObject[value.filterField] = value.filteredValue;
  });
  return filteredObject;
};

module.exports = {

  /**
   * Validate all the fields, even where values are not provided.
   * @param   {object} schemaFilters - filters to apply to values, eg. remove whitespace
   * @param   {object} schemaValitationRules - validation rules
   * @param   {object} values - object/values to apply filtering and validation to
   * @returns {Promise<{valid: boolean, values: object  errors: object}>}
   */
  validate: (schemaDefaults, schemaFilters, schemaValidationRules, values) => {
    let allValid = true;
    const errors = {};
    const validValues = {};
    
    return applyDefaults(schemaDefaults, values).then(defaultedValues => {
      
      return Promise.all(applyFilters(schemaFilters, defaultedValues)).then(filteredValues => {
        
        return Promise.all(validate(schemaValidationRules, createFilteredObject(filteredValues))).then(validationResults => {
          
          validationResults.forEach(result => {
            if (result.valid) {
              validValues[result.field] = result.validValue;
            } else {
              errors[result.field] = result.error;
            }

            allValid = allValid && result.valid;
          });

          return {valid: allValid, values: validValues, errors};
        });
      });
    });
  }
};
