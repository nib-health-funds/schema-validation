'use strict';
const assert = require('assert');
const validator = require('../lib/index.js');
const validate = require('@nib/validation-methods');

const REGEX_NAME = /^[a-zA-Z0-9\-\/' ]*$/;

function removeWhitespace(value) {
  return value.replace(/\s*/g, '');
}

function removeWhitespaceWithDelay(value, cb) {
  setTimeout(() => {
    cb(value.replace(/\s*/g, ''));
  }, 500);
}

let schema = {};

describe('schema-validator', () => {

  beforeEach(() => {
    schema = {};
  });

  describe('.validate()', () => {

    it('should return true when valid', (done) => {

      schema = {
        firstName: {
          filters: [removeWhitespace],
          validators: [
            [validate.maxlength(24), 'Sorry, our system can only handle up to 24 characters.'],
            [validate.regex(REGEX_NAME), 'First name contains invalid characters']
          ],
          empty: {
            default: ''
          }
        }
      };

      const objectToValidate = {
        firstName: 'Im here'
      };

      validator.validate(schema, objectToValidate).then((result) => {
        assert(result.valid);
        done();
      }).catch((err) => {
        done(err);
      });
    });

    it('should apply filter to specified value before validating', (done) => {

      schema = {
        phoneNumber: {
          filters: [removeWhitespace],
          validators: [
            [validate.maxlength(10), 'Your phone number is too long']
          ],
          empty: {
            default: ''
          }
        }
      };

      const objectToValidate = {
        phoneNumber: '02 9999 5555'
      };

      validator.validate(schema, objectToValidate).then((result) => {
        assert(result.valid);
        assert.equal(result.values.phoneNumber, '0299995555');
        done();
      }).catch((err) => {
        done(err);
      });

    });

    it('should apply long running filter to specified value before validating', (done) => {

      schema = {
        phoneNumber: {
          filters: [removeWhitespaceWithDelay],
          validators: [
            [validate.maxlength(10), 'Your phone number is too long']
          ],
          empty: {
            default: ''
          }
        }
      };

      const objectToValidate = {
        phoneNumber: '02 9999 5555'
      };

      validator.validate(schema, objectToValidate).then((result) => {

        assert(result.valid);
        assert.equal(result.values.phoneNumber, '0299995555');
        done();
      }).catch((err) => {
        done(err);
      });

    });

    it('should apply filter to multiple values before validating', (done) => {


      schema = {
        phoneNumber: {
          filters: [removeWhitespaceWithDelay],
          validators: [
            [validate.maxlength(10), 'Your phone number is too long']
          ],
          empty: {
            default: ''
          }
        },
        firstName: {
          filters: [removeWhitespaceWithDelay],
          validators: [[validate.maxlength(5), 'Your name is too long']],
          empty: {
            default: ''
          }
        }
      };

      const objectToValidate = {
        firstName: 'Mar io',
        phoneNumber: '02 9999 5555'
      };

      validator.validate(schema, objectToValidate).then((result) => {

        assert(result.valid);
        assert.equal(result.values.firstName, 'Mario');
        assert.equal(result.values.phoneNumber, '0299995555');
        done();
      }).catch((err) => {
        done(err);
      });

    });

    it('should default value and filter where object property has not been defined', (done) => {

      schema = {
        phoneNumber: {
          filters: [removeWhitespace],
          validators: [
            [validate.maxlength(10), 'Your phone number is too long']
          ],
          empty: {
            default: ''
          }
        },
        firstName: {
          filters: [removeWhitespaceWithDelay],
          validators: [[validate.maxlength(5), 'Your name is too long']],
          empty: {
            default: ''
          }
        }
      };

      const objectToValidate = {
        firstName: 'Mar io'  // phoneNumber has not yet been defined
      };

      validator.validate(schema, objectToValidate).then((result) => {
        assert.equal(result.valid, true);
        assert.equal(result.values.firstName, 'Mario');
        assert.equal(result.values.phoneNumber, '');
        done();
      }).catch((err) => {
        done(err);
      });

    });

    it('should return true when valid for multiple properties on schema', (done) => {

      schema = {
        firstName: {
          filters: [removeWhitespaceWithDelay],
          validators: [[validate.maxlength(20), 'Your name is too long']],
          empty: {
            default: ''
          }
        },
        lastName: {
          filters: [removeWhitespaceWithDelay],
          validators: [[validate.maxlength(20), 'Your name is too long']],
          empty: {
            default: ''
          }
        },
        middleName: {
          filters: [removeWhitespaceWithDelay],
          validators: [[validate.maxlength(20), 'Your name is too long']],
          empty: {
            default: ''
          }
        }
      };

      const objectToValidate = {
        firstName: 'Im here',
        lastName: 'And here',
        middleName: 'But not here'
      };

      assert(Object.keys(schema).length > 1);

      validator.validate(schema, objectToValidate).then((result) => {
        assert.equal(result.valid, true);
        done();
      }).catch((err) => {
        done(err);
      });

    });

    it('should return false when one property is invalid', (done) => {

      schema = {
        firstName: {
          filters: [removeWhitespaceWithDelay],
          validators: [[validate.maxlength(20), 'Your name is too long']],
          empty: {
            default: ''
          }
        },
        lastName: {
          filters: [removeWhitespaceWithDelay],
          validators: [[validate.maxlength(20), 'Your name is too long']],
          empty: {
            default: ''
          }
        },
        middleName: {
          filters: [removeWhitespaceWithDelay],
          validators: [[validate.maxlength(4), 'Your name is too long']],
          empty: {
            default: ''
          }
        }
      };

      const objectToValidate = {
        firstName: 'Im here',
        lastName: '',
        middleName: 'But not here'
      };

      validator.validate(schema, objectToValidate).then((result) => {
        assert.equal(result.valid, false);
        done();
      }).catch((err) => {
        done(err);
      });

    });

    it('should return false when all properties are invalid', (done) => {

      schema = {
        firstName: {
          filters: [removeWhitespaceWithDelay],
          validators: [[validate.maxlength(4), 'Your name is too long']],
          empty: {
            default: ''
          }
        },
        lastName: {
          filters: [removeWhitespaceWithDelay],
          validators: [[validate.maxlength(4), 'Your name is too long']],
          empty: {
            default: ''
          }
        },
        middleName: {
          filters: [removeWhitespaceWithDelay],
          validators: [[validate.maxlength(4), 'Your name is too long']],
          empty: {
            default: ''
          }
        }
      };

      const objectToValidate = {
        firstName: 'Im here',
        lastName: 'arghhhhhh',
        middleName: 'But not here'
      };

      assert(Object.keys(schema).length > 1);

      validator.validate(schema, objectToValidate).then((result) => {
        assert.equal(result.valid, false);
        done();
      }).catch((err) => {
        done(err);
      });

    });

    it('should return false when one out of many schema rules is invalid for single property', (done) => {

      schema = {
        firstName: {
          filters: [removeWhitespace],
          validators: [
            [validate.maxlength(24), 'Sorry, our system can only handle up to 24 characters.'],
            [validate.regex(REGEX_NAME), 'First name contains invalid characters']
          ],
          empty: {
            default: ''
          }
        }
      };

      const objectToValidate = {
        firstName: 'Im here$'
      };

      validator.validate(schema, objectToValidate).then((result) => {
        assert.equal(result.valid, false);
        done();
      }).catch((err) => {
        done(err);
      });

    });

    it('should return true when all schema rules are valid for single property', (done) => {

      schema = {
        firstName: {
          filters: [removeWhitespace],
          validators: [
            [validate.minlength(8), 'Sorry, our system.'],
            [validate.regex(REGEX_NAME), 'First name contains invalid characters']
          ],
          empty: {
            default: ''
          }
        }
      };

      const objectToValidate = {
        firstName: 'MoreThanEightChars'
      };

      validator.validate(schema, objectToValidate).then((result) => {
        console.log(result);
        assert.equal(result.valid, true);
        done();
      }).catch((err) => {
        done(err);
      });

    });

    it('should return values of valid fields only', (done) => {

      schema = {
        firstName: {
          filters: [removeWhitespace],
          validators: [
            [validate.maxlength(24), 'Sorry, our system.'],
            [validate.regex(REGEX_NAME), 'First name contains invalid characters']
          ],
          empty: {
            default: ''
          }
        },
        lastName: {
          filters: [removeWhitespace],
          validators: [
            [validate.maxlength(2), 'Sorry, our system hates you.'],
            [validate.regex(REGEX_NAME), 'Last name contains invalid characters']
          ],
          empty: {
            default: ''
          }
        }
      };

      validator.validate(schema, {firstName: 'Matt', lastName: 'Turner'})
        .then((result) => {
          assert.deepEqual(result.values, {firstName: 'Matt'});
          done();
        });
    });

    it('should validate nested JSON objects', (done) => {

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
                [validate.required, 'Not an object']
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
                    [validate.maxlength(2), 'abc must be less than 2 chars']
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

      validator.validate(schema, {hospitalProduct: {code: {extrasCode: '12', abc: 'more than 2 chars'}}})
        .then((result) => {
          assert.equal(result.valid, false);
          done();
        }).catch((err) => {
          done(err);
        });
    });

  });

});
