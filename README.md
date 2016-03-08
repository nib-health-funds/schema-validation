# @nib/schema-validator

A Universal-JavaScript utility for validating value objects.

## Installation

    npm install --save @nib/schema-validator

## Usage

```javascript
const validator = require('@nib/schema/validator');
const validate = require('@nib/validation-methods');

function trim(value) {
  return value.trim();
}

function stripWhitespace(value) {
  return value.replace(/\s*/g, '');
}

const schema = {

  firstName: {
    filters: [trim],
    validators: [
      [validate.minlength(5), 'First name must be at least 5 characters']
    ],
    empty: {
      default: null
    }
  },

  lastName: {
    filters: [trim],
    validators: [
      [validate.minlength(5), 'Last name must be at least 5 characters']
    ],
    empty: {
      default: null
    }
  },

  phoneNumber: {
    filters: [stripWhitespace],
    validators: [
     [validate.maxlength(10), 'Phone number must be no more than 10 digits']
    ],
    empty: {
      default: null
    }
  },

  email: {
    filters: [trim],
    validators: [
      [validate.email, 'Email must be a valid email address']
    ],
    empty: {
      default: null
    }
  }

};

const values1 = {
  firstName: 'Homer',
  phoneNumber: '02 9999 5555',
  email: 'homer.$#%@!'
};

validator.validate(schema, values1).then(result => {
  console.log(result.valid);  //false
  console.log(result.values); //{firstName: 'Homer', lastName: null, phoneNumber: '0299995555'}
  console.log(result.errors); //{email: 'Email must be a valid email address'}
});

const values2 = {
  firstName: 'Homer',
  lastName: 'Simpson',
  email: 'homer@simpson.com'
};

validator.validate(schema, values2).then(result => {
  console.log(result.valid, result.values, result.errors);
  console.log(result.valid);  //true
  console.log(result.values); //{firstName: 'Homer', lastName: 'Simpson, phoneNumber: null, email: 'homer@simpson.com'}
  console.log(result.errors); //{}
});

```

## API

### .validate(schema, values) : Promise

Validate all the fields, even where values are not provided.

