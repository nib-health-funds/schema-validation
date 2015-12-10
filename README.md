# schema-validator
Extends js-validator-chain to enable the re-use of object validation for the server side.
The server can use the same validation rules as the frontend for its api contracts by compiling multiple property
rules into a single validation chain, enabling the validation of a whole object and all its properties at once.

## Usage

In the following example we are using schema validate to compile the rules for each property of an object and validating a object against them.
To share the validation rules between the server and the client simply share a package with the schema(s) for the objects you will be validating.

    function required(value) {
      return value !== '';
    }

    function minFourCharacters(value) {
      return value.length >= 4;
    }

    const schema = {
      firstName: [
        [required, 'First name is required'],
        [minFourCharacters, 'First name needs to be at least 8 characters']
      ]
    }

    const objectToValidate = {
      firstName: 'Apu'
    }

    schemaValidator.validate(schema, objectToValidate).then((result) => {
      console.log(result.valid);
      console.log(result.errors);
    });
