# @nib/schema-validator

A Universal-JavaScript utility for validating value objects.

## Installation

    npm install --save @nib/schema-validator

## Usage

```javascript

const validator = require('@nib/schema-validator');
const validate = require('@nib/validation-methods');

const schemaValidationRules = {

  firstName: [
    [validate.required, 'First name is required'],
    [validate.minlength(5), 'First name must be at least 5 characters']
  ],

  lastName: [
    [validate.required, 'Last name is required'],
    [validate.minlength(5), 'Last name must be at least 5 characters']
  ],

  phoneNumber: [
    [validate.required, 'Phone number is required'],
    [validate.maxlength(10), 'Phone number must be no more than 10 digits']
  ],

  email: [
    [validate.required, 'Email is required'],
    [validate.email, 'Email must be a valid email address']
  ]

};

function removeWhitespace(value) {
  return value.replace(/\s*/g, '');
}

const schemaFilters = {
  phoneNumber: [removeWhitespace]
}

const schemaDefaults = {
  scale: 'Single'
}

const values = {
  firstName: 'Homer',
  phoneNumber: '02 9999 5555',
  email: 'homer.$#%@!'
};

validator.validate(schemaDefaults, schemaFilters, schemaValidationRules, values).then(result => {
  console.log(result.valid);  //false
  console.log(result.values); //{firstName: 'Homer', phoneNumber: '0299995555'}
  console.log(result.errors); //{email: 'Email must be a valid email address'}
});

```

## API

### .validate(schemaDefaults, schemaFilters, schemaValidationRules, values) : Promise

Validate all the fields, even where values are not provided.

