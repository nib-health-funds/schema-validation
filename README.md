# @nib/schema-validator

A Universal-JavaScript utility for validating value objects.

## Installation

    npm install --save @nib/schema-validator

## Usage

Validation is done by representing your 
javascript objects as a schema or set of nested schemas for more complex objects.
Schemas take the following form:
###Schema Example

```javascript
{
  filters: []
  validators: [],
  empty: {
    default: null
  },
  children: {
  }
}
```

###Validators
Validators are simple functions that take a single value and should return a boolean if
validation has passed for the specified value.

###Example
```javascript
function (value) {
  return value !== 'something';
}
```

###Filters
Filters are ran before validation and are used to normalise values. eg. Performing ```.toUpper``` on values.

###Example
```javascript
function (value) {
  return value.toUpper();
}
```

###Defaulting values
Values can be defaulted before validation if the value of the property is ```null```, ```undefined``` or an empty string.
Note: Validation is not run on defaulted values. It is assumed that your defaulted values are valid.
Undefined values that do not have a default value result in an error.

#Example
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

## Validating complex JSON schemas
You can validate nested JSON objects by adding a ```children``` object. 
Child schemas should follow the same schema as the original Schema object. 
See example below:

```
schema = {
        hospitalProduct: {
          filters: [],
          validators: [
            [validate.required, 'Not an object']
          ],
          empty: {
            default: ''
          },
          children: {
            code: {
              filters: [],
              validators: [
                [validate.required, 'Code is a required object']
              ],
              empty: {
                default: 'none'
              },
              children: {
                extrasCode: {
                  filters: [],
                  validators: [
                    [validate.maxlength(2)]
                  ],
                  empty: {
                    default: ''
                  }
                },
                abc: {
                  filters: [],
                  validators: [
                    [validate.maxlength(2)]
                  ],
                  empty: {
                    default: ''
                  }
                }
              }
            }
          }
        }
      };
```
##Note about ```filters``` and ```children```
Filters and children are currently incombatible with each other.
If filters are specified then child schemas **will not** be evaluated,
however any validators for a property that has children will be ran as well as the validations
for every nested children.

## API

### .validate(schema, values) : Promise

Validate all the fields, even where values are not provided.

