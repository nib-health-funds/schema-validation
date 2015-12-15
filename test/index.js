'use strict';
const assert = require('assert');
const validator = require('..');
const validate = require('@nib/validation-methods');

describe('schema-validator', () => {

  describe('.all()', () => {

    it('should return true when valid', (done) => {

      const schema = {
        firstName: [[validate.required, 'Your name is required']]
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


    it('should return true when valid for multiple properties on schema', (done) => {

      const schema = {
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

      validator.validate(schema, objectToValidate).then((result) => {
        assert.equal(result.valid, true);
        done();
      }).catch((err) => {
        done(err);
      });

    });

    it('should return false when one property is in-valid', (done) => {

      const schema = {
        firstName: [[validate.required, 'Your name is required']],
        lastName: [[validate.required, 'Your name is required']],
        middleName: [[validate.required, 'Your name is required']]
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

    it('should return false when all properties are in-valid', (done) => {

      const schema = {
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

      validator.validate(schema, objectToValidate).then((result) => {
        assert.equal(result.valid, false);
        done();
      }).catch((err) => {
        done(err);
      });

    });

    it('should return false when one out of many schema rules is invalid for single property', (done) => {

      const schema = {
        firstName: [
          [validate.required, 'Your name is required'],
          [validate.minlength(8), 'Name must be min 8 characters']
        ]
      };

      const objectToValidate = {
        firstName: 'Apu'
      };

      validator.validate(schema, objectToValidate).then((result) => {
        assert.equal(result.valid, false);
        done();
      }).catch((err) => {
        done(err);
      });

    });

    it('should return true when all schema rules are valid for single property', (done) => {

      const schema = {
        firstName: [
          [validate.required, 'Your name is required'],
          [validate.minlength(8), 'Name must be min 8 characters']
        ]
      };

      const objectToValidate = {
        firstName: 'MoreThanEightChars'
      };

      validator.validate(schema, objectToValidate).then((result) => {
        assert.equal(result.valid, true);
        done();
      }).catch((err) => {
        done(err);
      });

    });

  });

  describe('.partial()', () => {

    it('should return true when there are no values', () => {

      const schema = {
        firstName: [[validate.required, 'Your first name is required']],
        lastName: [[validate.required, 'Your last name is required']]
      };

      return validator.partial(schema, {})
        .then(result => assert(result.valid))
        ;

    });

    it('should return true when there are no invalid values', () => {

      const schema = {
        firstName: [[validate.required, 'Your first name is required']],
        lastName: [[validate.required, 'Your last name is required']]
      };

      return validator.partial(schema, {firstName: 'Matt', lastName: 'Smith'})
        .then(result => assert(result.valid))
        ;

    });

    it('should return false when there is an invalid value', () => {

      const schema = {
        firstName: [[validate.required, 'Your first name is required']],
        lastName: [[validate.required, 'Your last name is required']]
      };

      return validator.partial(schema, {firstName: ''})
        .then(result => assert(!result.valid))
        ;

    });

    it('should not return an error when there are no invalid values', () => {

      const schema = {
        firstName: [[validate.required, 'Your first name is required']],
        lastName: [[validate.required, 'Your last name is required']]
      };

      return validator.partial(schema, {firstName: 'Matt'})
        .then(result => assert.deepEqual(result.errors, {}))
        ;

    });

    it('should return an error when there is a invalid value', () => {

      const schema = {
        firstName: [[validate.required, 'Your first name is required']],
        lastName: [[validate.required, 'Your last name is required']]
      };

      return validator.partial(schema, {firstName: ''})
        .then(result => assert.equal(result.errors.firstName, 'Your first name is required'))
        ;

    });

  });

});
