'use strict';

module.exports = (schemaDefaults, values) => {
  
  const schemaKeys = Object.keys(schemaDefaults);
  const valueKeys = Object.keys(values);
  
  return new Promise(resolve => {
    
    schemaKeys.forEach(key => {
      if (valueKeys.indexOf(key) === -1) {
        values[key] = schemaDefaults[key];
      }
    });
    
    resolve(values);
    
  });
};
