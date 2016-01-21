'use strict';
const assert = require('assert');
const validator = require('../lib/index.js');
const validate = require('@nib/validation-methods');

function removeWhitespace(value) {
  return value.replace(/\s*/g, '');
}

function removeWhitespaceWithDelay(value, cb) {
  setTimeout(function() {
    cb(value.replace(/\s*/g, '')); 
  }, 500);
}

let filters = {};
let schema = {};

describe('schema-validator', () => {

  beforeEach(() => {
    filters = {};
    schema = {};
  });

  describe('.all()', () => {

    it('should return true when valid', (done) => {

      schema = {
        firstName: [[validate.required, 'Your name is required']]
      };

      filters = {
        firstName: [removeWhitespace]
      };

      const objectToValidate = {
        firstName: 'Im here'
      };

      validator.all(filters, schema, objectToValidate).then((result) => {
        assert(result.valid);
        done();
      }).catch((err) => {
        done(err);
      });

    });

    it('should apply filter to specified value before validating', (done) => {

      schema = {
        phoneNumber: [[validate.required, 'Your phoneNumber is required'],
                      [validate.maxlength(10), 'Your phone number is too long']]
      };
 
      filters = {
        phoneNumber: [removeWhitespace]
      };

      const objectToValidate = {
        firstName: 'I have no filter',
        phoneNumber: '02 9999 5555'
      };

      validator.all(filters, schema, objectToValidate).then((result) => {
        assert(result.valid);
        assert.equal(result.values.phoneNumber, '0299995555');
        done();
      }).catch((err) => {
        done(err);
      });

    });    

    it('should apply long running filter to specified value before validating', (done) => {

      schema = {
        phoneNumber: [[validate.required, 'Your phoneNumber is required'],
                      [validate.maxlength(10), 'Your phone number is too long']]
      };
 
      filters = {
        phoneNumber: [removeWhitespaceWithDelay]
      };

      const objectToValidate = {
        firstName: 'I have no filter',
        phoneNumber: '02 9999 5555'
      };

      validator.all(filters, schema, objectToValidate).then((result) => {
        
        assert(result.valid);
        assert.equal(result.values.phoneNumber, '0299995555');
        done();
      }).catch((err) => {
        done(err);
      });

    });    

    it('should apply filter to multiple values before validating', (done) => {

      schema = {
        firstName: [[validate.maxlength(5), 'Your name is too long']],
        phoneNumber: [[validate.required, 'Your phoneNumber is required'],
                      [validate.maxlength(10), 'Your phone number is too long']]
      };
 
      filters = {
        firstName: [removeWhitespaceWithDelay],
        phoneNumber: [removeWhitespaceWithDelay]
      };

      const objectToValidate = {
        firstName: 'Mar io',
        phoneNumber: '02 9999 5555'
      };

      validator.all(filters, schema, objectToValidate).then((result) => {
        
        assert(result.valid);
        assert.equal(result.values.firstName, 'Mario');
        assert.equal(result.values.phoneNumber, '0299995555');
        done();
      }).catch((err) => {
        done(err);
      });

    }); 

    it('should handle applying filter where object property has not been defined', (done) => {

      schema = {
        firstName: [[validate.maxlength(5), 'Your name is too long']],
        phoneNumber: [[validate.required, 'Your phoneNumber is required'],
                      [validate.maxlength(10), 'Your phone number is too long']]
      };
 
      filters = {
        firstName: [removeWhitespaceWithDelay],
        phoneNumber: [removeWhitespace]
      };

      const objectToValidate = {
        firstName: 'Mar io'  // phoneNumber has not yet been defined        
      };

      validator.all(filters, schema, objectToValidate).then((result) => {  
        assert.equal(result.valid, false);
        assert.equal(result.values.firstName, 'Mario');
        done();
      }).catch((err) => {
        done(err);
      });

    }); 

    it('should return true when valid for multiple properties on schema', (done) => {

      schema = {
        firstName: [[validate.required, 'Your name is required']],
        lastName: [[validate.required, 'Your name is required']],
        middleName: [[validate.required, 'Your name is required']]
      };

      const objectToValidate = {
        firstName: 'Im here',
        lastName: 'And here',
        middleName: 'But not here'
      };

      assert(Object.keys(schema).length > 1);

      validator.all(filters, schema, objectToValidate).then((result) => {
        assert.equal(result.valid, true);
        done();
      }).catch((err) => {
        done(err);
      });

    });

    it('should return false when one property is in-valid', (done) => {

      schema = {
        firstName: [[validate.required, 'Your name is required']],
        lastName: [[validate.required, 'Your name is required']],
        middleName: [[validate.required, 'Your name is required']]
      };

      const objectToValidate = {
        firstName: 'Im here',
        lastName: '',
        middleName: 'But not here'
      };

      validator.all(filters, schema, objectToValidate).then((result) => {
        assert.equal(result.valid, false);
        done();
      }).catch((err) => {
        done(err);
      });

    });

    it('should return false when all properties are in-valid', (done) => {

      schema = {
        firstName: [[validate.required, 'Your name is required']],
        lastName: [[validate.required, 'Your name is required']],
        middleName: [[validate.required, 'Your name is required']]
      };

      const objectToValidate = {
        firstName: '',
        lastName: '',
        middleName: ''
      };

      assert(Object.keys(schema).length > 1);

      validator.all(filters, schema, objectToValidate).then((result) => {
        assert.equal(result.valid, false);
        done();
      }).catch((err) => {
        done(err);
      });

    });

    it('should return false when one out of many schema rules is invalid for single property', (done) => {

      schema = {
        firstName: [
          [validate.required, 'Your name is required'],
          [validate.minlength(8), 'Name must be min 8 characters']
        ]
      };

      const objectToValidate = {
        firstName: 'Apu'
      };

      validator.all(filters, schema, objectToValidate).then((result) => {
        assert.equal(result.valid, false);
        done();
      }).catch((err) => {
        done(err);
      });

    });

    it('should return true when all schema rules are valid for single property', (done) => {

      schema = {
        firstName: [
          [validate.required, 'Your name is required'],
          [validate.minlength(8), 'Name must be min 8 characters']
        ]
      };

      const objectToValidate = {
        firstName: 'MoreThanEightChars'
      };

      validator.all(filters, schema, objectToValidate).then((result) => {
        assert.equal(result.valid, true);
        done();
      }).catch((err) => {
        done(err);
      });

    });

    it('should return values of valid fields', () => {

      schema = {
        firstName: [[validate.required, 'Your first name is required']],
        lastName: [[validate.required, 'Your last name is required']]
      };

      return validator.all(filters, schema, {firstName: 'Matt'})
        .then(result => assert.deepEqual(result.values, {firstName: 'Matt'}))
        ;

    });

  });

  describe('.partial()', () => {

    it('should return true when there are no values', () => {

      schema = {
        firstName: [[validate.required, 'Your first name is required']],
        lastName: [[validate.required, 'Your last name is required']]
      };

      return validator.partial(filters, schema, {})
        .then(result => assert(result.valid))
      ;

    });

    it('should apply filter to multiple values before validating', (done) => {
      
      schema = {
        firstName: [[validate.required, 'Your first name is required']],
        lastName: [[validate.required, 'Your last name is required']],
        phoneNumber: [[validate.required, 'Your phoneNumber is required'],
                      [validate.maxlength(10), 'Your phone number is too long']]
      };
 
      filters = {
        firstName: [removeWhitespaceWithDelay],
        phoneNumber: [removeWhitespaceWithDelay]
      };

      const objectToValidate = {
        firstName: 'Mar io',  // deliberately leave out last name for partial validation
        phoneNumber: '02 9999 5555'
      };

      validator.partial(filters, schema, objectToValidate).then((result) => {
        
        assert(result.valid);
        assert.equal(result.values.firstName, 'Mario');
        assert.equal(result.values.phoneNumber, '0299995555');
        done();
      }).catch((err) => {
        done(err);
      });

      
    });

    it('should return true when there are no invalid values', () => {

      schema = {
        firstName: [[validate.required, 'Your first name is required']],
        lastName: [[validate.required, 'Your last name is required']]
      };

      return validator.partial(filters, schema, {firstName: 'Matt', lastName: 'Smith'})
        .then(result => assert(result.valid))
      ;

    });

    it('should return false when there is an invalid value', () => {

      schema = {
        firstName: [[validate.required, 'Your first name is required']],
        lastName: [[validate.required, 'Your last name is required']]
      };

      return validator.partial(filters, schema, {firstName: ''})
        .then(result => assert(!result.valid))
      ;

    });

    it('should return values of valid fields', () => {

      schema = {
        firstName: [[validate.required, 'Your first name is required']],
        lastName: [[validate.required, 'Your last name is required']]
      };

      return validator.partial(filters, schema, {firstName: 'Matt'})
        .then(result => assert.deepEqual(result.values, {firstName: 'Matt'}))
      ;

    });

    it('should not return an error when there are no invalid values', () => {

      schema = {
        firstName: [[validate.required, 'Your first name is required']],
        lastName: [[validate.required, 'Your last name is required']]
      };

      return validator.partial(filters, schema, {firstName: 'Matt'})
        .then(result => assert.deepEqual(result.errors, {}))
      ;

    });

    it('should return an error when there is a invalid value', () => {

      schema = {
        firstName: [[validate.required, 'Your first name is required']],
        lastName: [[validate.required, 'Your last name is required']]
      };

      return validator.partial(filters, schema, {firstName: ''})
        .then(result => assert.equal(result.errors.firstName, 'Your first name is required'))
      ;

    });

  });

});
