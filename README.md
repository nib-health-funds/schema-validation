# schema-validator
Extends js-validator-chain to enable the re-use of object validation for the server side.
The server can use the same validation rules as the frontend for its api contracts by compiling multiple property
rules into a single validation chain, enabling the validation of a whole object and all its properties at once.

## Usage

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

    const objectToValidate = {
      firstName: 'Apu'
    }

    schemaValidator.validate(schema, objectToValidate).then((result) => {
      console.log(result.valid);
      console.log(result.errors);
    });
