const validator = require('..');
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

const values1 = {
  firstName: 'Homer',
  email: 'homer.$#%@!'
};

validator.all(schema, values1).then(result => {
  console.log(result.valid, result.values, result.errors);
});

const values2 = {
  firstName: 'Homer',
  lastName: 'Simpson',
  email: 'homer@simpson.com'
};

validator.all(schema, values2).then(result => {
  console.log(result.valid, result.values, result.errors);
});
