const schemaValidator = require('@nib/schema-validator');

function required(value) {
  return value !== '';
}

function minEightCharacters(value) {
  return value.length >= 4;
}

const schema = {
  firstName: [
    [required, 'First name is required'],
    [minEightCharacters, 'First name needs to be atleast 8 characters']
  ]
}

const badEgg = {
  firstName: 'Apu'
}

const goodEgg = {
  firstName: 'Matthew'
}

schemaValidator.validate(schema, badEgg).then((result) => {
  console.log(result.valid);
  console.log(result.errors);
});

schemaValidator.validate(schema, goodEgg).then((result) => {
  console.log(result.valid);
});
