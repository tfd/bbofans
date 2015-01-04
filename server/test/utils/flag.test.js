/* jshint -W030 */
var flag = require('../../src/utils/chai/flag');

describe('flag method', function () {
  var obj;

  beforeEach(function () {
    obj = {};
  });

  it('should exist', function () {
    expect(flag).to.be.a('function');
  });

  it('should return undefined on get', function () {
    expect(flag(obj, 'test')).to.be.undefined;
  });

  it('should return value after set', function () {
    flag(obj, 'test', 1);
    expect(flag(obj, 'test')).to.be.equal(1);
  });

  it('should update value after second set', function () {
    flag(obj, 'test', 1);
    expect(flag(obj, 'test')).to.be.equal(1);

    flag(obj, 'test', false);
    expect(flag(obj, 'test')).to.be.equal(false);
  });

});