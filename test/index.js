'use strict';
const schemaValidator = require('../index.js');
const assert = require('assert');

describe('schema-validator', () => {

  describe('validate', () => {

    it('should return true when valid', (done) => {

      function required(value) {
        return value !== '';
      }

      const schema = {
        firstName: [[required, 'Your name is required']]
      };

      const objectToValidate = {
        firstName: 'Im here'
      };

      schemaValidator.validate(schema, objectToValidate).then((result) => {
        assert(result.valid);
        done();
      }).catch((err) => {
        done(err);
      });

    });


    it('should return true when valid for multiple properties on schema', (done) => {

      function required(value) {
        return value !== '';
      }

      const schema = {
        firstName: [[required, 'Your name is required']],
        lastName: [[required, 'Your name is required']],
        middleName: [[required, 'Your name is required']]
      };

      const objectToValidate = {
        firstName: 'Im here',
        lastName: 'And here',
        middleName: 'But not here'
      };

      assert(Object.keys(schema).length > 1);

      schemaValidator.validate(schema, objectToValidate).then((result) => {
        assert.equal(result.valid, true);
        done();
      }).catch((err) => {
        done(err);
      });

    });

    it('should return false when one property is in-valid', (done) => {

      function required(value) {
        return value !== '';
      }

      const schema = {
        firstName: [[required, 'Your name is required']],
        lastName: [[required, 'Your name is required']],
        middleName: [[required, 'Your name is required']]
      };

      const objectToValidate = {
        firstName: 'Im here',
        lastName: '',
        middleName: 'But not here'
      };

      schemaValidator.validate(schema, objectToValidate).then((result) => {
        assert.equal(result.valid, false);
        done();
      }).catch((err) => {
        done(err);
      });

    });

    it('should return false when all properties are in-valid', (done) => {

      function required(value) {
        return value !== '';
      }

      const schema = {
        firstName: [[required, 'Your name is required']],
        lastName: [[required, 'Your name is required']],
        middleName: [[required, 'Your name is required']]
      };

      const objectToValidate = {
        firstName: '',
        lastName: '',
        middleName: ''
      };

      assert(Object.keys(schema).length > 1);

      schemaValidator.validate(schema, objectToValidate).then((result) => {
        assert.equal(result.valid, false);
        done();
      }).catch((err) => {
        done(err);
      });

    });

    it('should return false when one out of many schema rule is invalid for single property', (done) => {

      function required(value) {
        return value !== '';
      }

      function minEightCharacters(value) {
        return value.length >= 8;
      }

      const schema = {
        firstName: [
          [required, 'Your name is required'],
          [minEightCharacters, 'Name must be min 8 characters'],
        ]
      };

      const objectToValidate = {
        firstName: 'Apu'
      };

      schemaValidator.validate(schema, objectToValidate).then((result) => {
        assert.equal(result.valid, false);
        done();
      }).catch((err) => {
        done(err);
      });

    });

    it('should return true when all schema rules are valid for single property', (done) => {

      function required(value) {
        return value !== '';
      }

      function minEightCharacters(value) {
        return value.length >= 8;
      }

      const schema = {
        firstName: [
          [required, 'Your name is required'],
          [minEightCharacters, 'Name must be min 8 characters'],
        ]
      };

      const objectToValidate = {
        firstName: 'MoreThanEightChars'
      };

      schemaValidator.validate(schema, objectToValidate).then((result) => {
        assert.equal(result.valid, true);
        done();
      }).catch((err) => {
        done(err);
      });

    });

  });

});
