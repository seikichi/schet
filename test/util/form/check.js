'use strict';

var assert = require('power-assert');

var whitespace = require('../../../src/util/form/constants').whitespace;
var sanitizers = require('../../../src/util/form/sanitizers');
var validators = require('../../../src/util/form/validators');
var def = require('../../../src/util/form/def');
var check = require('../../../src/util/form/check');

describe('check', function () {
  it('return object sanitized by sanitizer', function () {
    let given = {
      1: '   foo   ',
      2: '   bar   '
    };

    let expected = {
      1: 'foo',
      2: 'bar'
    };

    let actual = check(given, [
      def(/^\d+$/, 1, sanitizers.strip)
    ]);

    assert.deepEqual(actual, expected);
  });

  it('throws Error when a parameter matches to multiple definitions.', function () {
    assert.throws(function () {
      check({
        1: 'foo',
        2: 'bar'
      }, [
        def(/^\d+$/, 1),
        def(/^[0-9]*$/, 1)
      ]);
    });
  });

  it('skips sanitize when the sanitizer is undefined.', function () {
    let given = {
      1: 'foo',
      2: 'bar'
    };

    let expected = given;

    let actual = check(given, [
      def(/^\d+$/, 1)
    ]);

    assert.deepEqual(actual, expected);
  });

  it('skips validation when the validator is undefined.', function () {
    let given = {
      1: '   foo   ',
      2: '   bar   '
    };

    let expected = given;

    let actual = check(given, [
      def(/^\d+$/, 1)
    ]);

    assert.deepEqual(actual, expected);
  });

  it('throws Error when the validator returned false.', function () {
    let given = {
      1: 'foo',
      2: whitespace
    };

    assert.throws(function () {
      check(given, [
        def(/^\d+$/, 1, sanitizers.strip, validators.isNotWhitespace)
      ]);
    });
  });

  it('throws Error when a parameter does not match to any definition.', function () {
    let given = {
      foo: 1,
      bar: 2
    };

    assert.throws(function () {
      check(given, [
        def(/^\d+$/, 1)
      ]);
    });
  });

  it('throws Error when def(*, true, *, *) matched twice and more', function () {
    let given = {
      1: 'foo',
      2: 'bar'
    };

    assert.throws(function () {
      check(given, [
        def(/^\d+$/, true)
      ]);
    });
  });

  it('does not throws Error when def(*, false, *, *) matched no times', function () {
    let given = {
      foo: 1,
      bar: 2
    };

    let expected = {
      foo: 1,
      bar: 2
    };

    let actual = check(given, [
      def('foo', true),
      def('bar', true),
      def(/^\d+$/, false)    // this def will not match.
    ]);

    assert.deepEqual(actual, expected);
  });

  it('throws Error when def(*, 2, *, *) matched only once.', function () {
    let given = {
      1: 'foo'
    };

    assert.throws(function () {
      check(given, [
        def(/^\d+$/, 2)
      ]);
    });
  });
});