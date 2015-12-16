# @nib/schema-validator

A Universal-JavaScript utility for validating value objects.

## Installation

    npm install --save @nib/schema-validator

## Usage

```javascript

const validator = require('@nib/schema-validator');
const validate = require('@nib/validation-methods');

const schema = {

  firstName: [
    [validate.required, 'First name is required'],
    [validate.minlength(5), 'First name must be at least 5 characters']
  ],

  lastName: [
    [validate.required, 'Last name is required'],
    [validate.minlength(5), 'Last name must be at least 5 characters']
  ],

  email: [
    [validate.required, 'Email is required'],
    [validate.email, 'Email must be a valid email address']
  ]

};

const values = {
  firstName: 'Homer',
  email: 'homer.$#%@!'
};

validator.all(schema, values).then(result => {
  console.log(result.valid);  //false
  console.log(result.values); //{firstName: 'Homer'}
  console.log(result.errors); //{email: 'Email must be a valid email address'}
});

```

## API

### .all(schema, values) : Promise

Validate all the fields, even where values are not provided.

### .partial(schema, values) : Promise

Validate only the fields where a value was provided.

