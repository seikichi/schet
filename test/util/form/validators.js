'use strict';

var assert = require('power-assert');

var whitespace = require('../../../src/util/form/constants').whitespace;
var validators = require('../../../src/util/form/validators');

describe('validators', function () {
  describe('isNotWhitespace', function () {
    it('should return true when str is empty.', function () {
      let actual = validators.isNotWhitespace('');
      let expected = false;

      assert(actual === expected);
    });

    it('should return true when str is whitespace.', function () {
      let actual = validators.isNotWhitespace(whitespace);
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str includes non whitespace.', function () {
      let actual = validators.isNotWhitespace(whitespace + 'foo');
      let expected = true;

      assert(actual === expected);
    });

    it('should return false when str includes non whitespace.', function () {
      let actual = validators.isNotWhitespace('foo' + whitespace);
      let expected = true;

      assert(actual === expected);
    });
  });

  describe('isOneLine', function () {
    it('should return false when str contains \\n', function () {
      let actual = validators.isOneLine('hello\nworld');
      let expected = false;

      assert(actual === expected);
    });
    it('should return false when str contains \\r', function () {
      let actual = validators.isOneLine('hello\rworld');
      let expected = false;

      assert(actual === expected);
    });
    it('should return false when str contains \\r\\n', function () {
      let actual = validators.isOneLine('hello\r\nworld');
      let expected = false;

      assert(actual === expected);
    });

    it('should return true when str does not contains new line', function () {
      let actual = validators.isOneLine('hello world');
      let expected = true;

      assert(actual === expected);
    });
  });

  describe('list', function () {
    it('with no params should throws Error', function () {
      assert.throws(function () {
        validators.list();
      });
    });

    it('should return true when value is in list.', function () {
      let v = validators.list('foo', 'bar', 'baz');

      assert(v('foo') === true);
      assert(v('bar') === true);
      assert(v('baz') === true);
      assert(v('qux') === false);
    });
  });

  describe('ge', function () {
    it('(-1) should return true when value is greater than or equal to -1.', function () {
      let v = validators.ge(-1);

      assert(v(-2) === false);
      assert(v(-1) === true);
      assert(v(+0) === true);
      assert(v(+1) === true);
    });

    it('(0) should return true when value is greater than or equal to 0.', function () {
      let v = validators.ge(0);

      assert(v(-1) === false);
      assert(v(+0) === true);
      assert(v(+1) === true);
    });

    it('(1) should return true when value is greater than or equal to 1.', function () {
      let v = validators.ge(1);

      assert(v(-1) === false);
      assert(v(+0) === false);
      assert(v(+1) === true);
      assert(v(+2) === true);
    });
  });

  describe('range', function () {
    it('(1, -1) should throws Error', function () {
      assert.throws(function () {
        validators.range(1, -1);
      });
    });

    it('(-2, -1) should return true when (-2 <= value <= -1).', function () {
      let v = validators.range(-2, -1);

      assert(v(-3) === false);
      assert(v(-2) === true);
      assert(v(-1) === true);
      assert(v(+0) === false);
      assert(v(+1) === false);
    });

    it('(-1, 1) should return true when (-1 <= value <= 1).', function () {
      let v = validators.range(-1, 1);

      assert(v(-2) === false);
      assert(v(-1) === true);
      assert(v(+0) === true);
      assert(v(+1) === true);
      assert(v(+2) === false);
    });

    it('(1, 2) should return true when (1 <= value <= 2).', function () {
      let v = validators.range(1, 2);

      assert(v(-1) === false);
      assert(v(+0) === false);
      assert(v(+1) === true);
      assert(v(+2) === true);
      assert(v(+3) === false);
    });
  });

  describe('length', function () {
    it('(2, 1) should throws Error', function () {
      assert.throws(function () {
        validators.length(2, 1);
      });
    });

    it('(-1, 1) should throws Error', function () {
      assert.throws(function () {
        validators.length(-1, 1);
      });
    });

    it('(0, 0) should return true when (value.length == 0).', function () {
      let v = validators.length(0, 0);

      assert(v('') === true);
      assert(v('1') === false);
    });

    it('(0, 2) should return true when (0 <= value.length <= 2).', function () {
      let v = validators.length(0, 2);

      assert(v('') === true);
      assert(v('1') === true);
      assert(v('12') === true);
      assert(v('123') === false);
    });

    it('(1, 2) should return true when (1 <= value.length <= 2).', function () {
      let v = validators.length(1, 2);

      assert(v('') === false);
      assert(v('1') === true);
      assert(v('12') === true);
      assert(v('123') === false);
    });
  });

  describe('date', function () {
    it('should return false when str is wrong format.', function () {
      let actual = validators.isDateString('foo');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is wrong year format.', function () {
      let actual = validators.isDateString('01234-01-01');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is wrong month format.', function () {
      let actual = validators.isDateString('1970-012-01');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is wrong date format.', function () {
      let actual = validators.isDateString('1970-01-012');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date format with incorrect month.', function () {
      let actual = validators.isDateString('1970-00-01');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date format with incorrect month.', function () {
      let actual = validators.isDateString('1970-13-01');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date format with incorrect date.', function () {
      let actual = validators.isDateString('1970-01-00');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date format with incorrect date.', function () {
      let actual = validators.isDateString('1970-02-30');
      let expected = false;

      assert(actual === expected);
    });

    it('should return true when str is correct date format.', function () {
      let actual = validators.isDateString('1970-01-01');
      let expected = true;

      assert(actual === expected);
    });

    it('should return true when str is correct date format.', function () {
      let actual = validators.isDateString('1970-12-31');
      let expected = true;

      assert(actual === expected);
    });
  });

  describe('date range', function () {
    it('should return false when str is correct date range format with incorrect start month.', function () {
      let actual = validators.isDateString('1970-00-01/1970-01-01');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date range format with incorrect start date.', function () {
      let actual = validators.isDateString('1970-01-00/1970-03-01');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date range format with incorrect start date.', function () {
      let actual = validators.isDateString('1970-02-30/1970-03-01');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date range format with incorrect end month.', function () {
      let actual = validators.isDateString('1970-01-01/1970-13-01');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date range format with incorrect end date.', function () {
      let actual = validators.isDateString('1970-01-01/1970-02-00');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date range format with incorrect end date.', function () {
      let actual = validators.isDateString('1970-01-01/1970-02-30');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date range format but end date equals to start date.', function () {
      let actual = validators.isDateString('1970-01-01/1970-01-01');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date range format but end date earlier than start date.', function () {
      let actual = validators.isDateString('1970-01-02/1970-01-01');
      let expected = false;

      assert(actual === expected);
    });

    it('should return true when str is correct date range format.', function () {
      let actual = validators.isDateString('1970-01-01/1970-01-02');
      let expected = true;

      assert(actual === expected);
    });

    it('should return true when str is correct date range format.', function () {
      let actual = validators.isDateString('0000-01-01/9999-12-31');
      let expected = true;

      assert(actual === expected);
    });
  });

  describe('date time', function () {
    it('should return false when str is wrong date time format in year.', function () {
      let actual = validators.isDateString('01234-01-01T00:00Z');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is wrong date time format in month.', function () {
      let actual = validators.isDateString('1970-012-01T00:00Z');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is wrong date time format in date.', function () {
      let actual = validators.isDateString('1970-01-012T00:00Z');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is wrong date time format in hours.', function () {
      let actual = validators.isDateString('1970-01-01T012:00Z');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is wrong date time format in minutes.', function () {
      let actual = validators.isDateString('1970-01-01T00:012Z');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is wrong date time format in minutes.', function () {
      let actual = validators.isDateString('1970-01-01T00:012Z');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date time format with incorrect month.', function () {
      let actual = validators.isDateString('1970-00-01T00:00Z');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date time format with incorrect month.', function () {
      let actual = validators.isDateString('1970-13-01T00:00Z');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date time format with incorrect date.', function () {
      let actual = validators.isDateString('1970-01-00T00:00Z');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date time format with incorrect date.', function () {
      let actual = validators.isDateString('1970-02-30T00:00Z');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date time format with incorrect hours.', function () {
      let actual = validators.isDateString('1970-01-01T25:00Z');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date time format with incorrect minutes.', function () {
      let actual = validators.isDateString('1970-01-01T00:60Z');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date time format with incorrect time.', function () {
      let actual = validators.isDateString('1970-01-01T24:01Z');
      let expected = false;

      assert(actual === expected);
    });

    it('should return true when str is correct date time format.', function () {
      let actual = validators.isDateString('1970-01-01T00:00Z');
      let expected = true;

      assert(actual === expected);
    });

    it('should return true when str is correct date time format.', function () {
      let actual = validators.isDateString('1970-01-01T00:01Z');
      let expected = true;

      assert(actual === expected);
    });

    it('should return true when str is correct date time format.', function () {
      let actual = validators.isDateString('1970-01-01T23:59Z');
      let expected = true;

      assert(actual === expected);
    });

    it('should return true when str is correct date time format.', function () {
      let actual = validators.isDateString('1970-01-01T24:00Z');
      let expected = true;

      assert(actual === expected);
    });
  });

  describe('date time range', function () {
    // incorrect start format

    it('should return false when str is wrong date time format in start year.', function () {
      let actual = validators.isDateString('00000-01-01T00:00Z/0001-01-01T00:00Z');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is wrong date time format in start month.', function () {
      let actual = validators.isDateString('1970-001-01T00:00Z/1970-01-02T00:00Z');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is wrong date time format in start date.', function () {
      let actual = validators.isDateString('1970-01-001T00:00Z/1970-01-02T00:00Z');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is wrong date time format in start hours.', function () {
      let actual = validators.isDateString('1970-01-01T000:00Z/1970-01-01T00:01Z');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is wrong date time format in start minutes.', function () {
      let actual = validators.isDateString('1970-01-01T00:001Z/1970-01-01T00:02Z');
      let expected = false;

      assert(actual === expected);
    });

    // incorrect end format

    it('should return false when str is wrong date time format in end year.', function () {
      let actual = validators.isDateString('0000-01-01T00:00Z/00001-01-01T00:00Z');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is wrong date time format in end month.', function () {
      let actual = validators.isDateString('1970-01-01T00:00Z/1970-001-02T00:00Z');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is wrong date time format in end date.', function () {
      let actual = validators.isDateString('1970-01-01T01:00Z/1970-01-002T00:00Z');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is wrong date time format in end hours.', function () {
      let actual = validators.isDateString('1970-01-01T00:00Z/1970-01-01T001:00Z');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is wrong date time format in end minutes.', function () {
      let actual = validators.isDateString('1970-01-01T00:00Z/1970-01-01T00:001Z');
      let expected = false;

      assert(actual === expected);
    });

    // incorrect start value

    it('should return false when str is correct date time format with incorrect start month.', function () {
      let actual = validators.isDateString('1970-00-01T00:00Z/1970-01-01T00:00Z');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date time format with incorrect start date.', function () {
      let actual = validators.isDateString('1970-01-00T00:00Z/1970-01-01T00:00Z');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date time format with incorrect start date.', function () {
      let actual = validators.isDateString('1970-02-30T00:00Z/1970-03-01T00:00Z');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date time format with incorrect start hours.', function () {
      let actual = validators.isDateString('1970-01-01T25:00Z/1970-02-01T00:00Z');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date time format with incorrect start minutes.', function () {
      let actual = validators.isDateString('1970-01-01T00:60Z/1970-01-02T00:00Z');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date time format with incorrect start time.', function () {
      let actual = validators.isDateString('1970-01-01T24:01Z/1970-02-01T00:00Z');
      let expected = false;

      assert(actual === expected);
    });

    // incorrect end value

    it('should return false when str is correct date time format with incorrect end month.', function () {
      let actual = validators.isDateString('1970-01-01T00:00Z/1970-13-01T00:00Z');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date time format with incorrect end date.', function () {
      let actual = validators.isDateString('1970-01-01T00:00Z/1970-02-00T00:00Z');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date time format with incorrect end date.', function () {
      let actual = validators.isDateString('1970-02-01T00:00Z/1970-02-30T00:00Z');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date time format with incorrect end hours.', function () {
      let actual = validators.isDateString('1970-01-01T00:00Z/1970-02-01T25:00Z');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date time format with incorrect end minutes.', function () {
      let actual = validators.isDateString('1970-01-01T00:00Z/1970-01-01T00:60Z');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date time format with incorrect end time.', function () {
      let actual = validators.isDateString('1970-01-01T00:00Z/1970-01-01T24:01Z');
      let expected = false;

      assert(actual === expected);
    });

    // incorrect value

    it('should return false when end time equals to start time.', function () {
      let actual = validators.isDateString('1970-01-01T00:00Z/1970-01-01T00:00Z');
      let expected = false;

      assert(actual === expected);
    });

    it('should return false when end time is earlier than start time.', function () {
      let actual = validators.isDateString('1970-01-01T00:01Z/1970-01-01T00:00Z');
      let expected = false;

      assert(actual === expected);
    });

    // correct format and value

    it('should return true when str is correct date time range format.', function () {
      let actual = validators.isDateString('1970-01-01T00:00Z/1970-01-01T00:01Z');
      let expected = true;

      assert(actual === expected);
    });

    it('should return true when str is correct date time range format.', function () {
      let actual = validators.isDateString('1970-01-01T00:00Z/1970-01-01T24:00Z');
      let expected = true;

      assert(actual === expected);
    });

    it('should return true when str is correct date time range format.', function () {
      let actual = validators.isDateString('1970-01-01T23:59Z/1970-01-01T24:00Z');
      let expected = true;

      assert(actual === expected);
    });

    it('should return true when str is correct date time range format.', function () {
      let actual = validators.isDateString('0000-01-01T00:00Z/9999-12-31T24:00Z');
      let expected = true;

      assert(actual === expected);
    });
  });
});