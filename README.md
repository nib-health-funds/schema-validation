# @nib/schema-validator

A Universal-JavaScript utility for validating value objects.

## Installation

    npm install --save @nib/schema-validator

## Usage

```javascript

const validator = require('@nib/schema-validator');
const validate = require('@nib/validation-methods');

const schema = {

  name: [
    [validate.required, 'Name is required'],
    [validate.minlength(5), 'Name must be at least 5 characters']
  ],

  email: [
    [validate.required, 'Email is required'],
    [validate.email, 'Email must be a valid email address']
  ]

};

const values = {
  name: 'Homer'
};

validator.all(schema, values).then(result => {
  console.log(result.valid);
  console.log(result.errors);
});

```

## API

### .all(schema, values)

Validate all the fields, even where values are not provided.

### .partial(schema, values)

Validate only the fields where a value was provided.

