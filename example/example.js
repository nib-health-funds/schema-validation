const validator = require('..');
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

const values1 = {
  name: 'Homer'
};

validator.all(schema, values1).then(result => {
  console.log(result.valid, result.errors);
});

const values2 = {
  name: 'Homer',
  email: 'homer@simpson.com'
};

validator.all(schema, values2).then(result => {
  console.log(result.valid, result.errors);
});
