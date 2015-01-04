/* jshint -W030 */
var addProperty = require('../../src/utils/chai/addProperty');

describe('addProperty function', function () {

  var obj;

  beforeEach(function () {
    obj = {};
  });

  it('should exist', function () {
    expect(addProperty).to.be.a('function');
  });

  it('should add a property to the object', function () {
    expect(obj).not.has.property('test');

    addProperty(obj, 'test', function () {});

    expect(obj).has.property('test');
  });

  describe('added property', function () {

    it('should return the object on default', function () {
      addProperty(obj, 'test', function () {});

      expect(obj.test).to.be.equal(obj);
    });

    it('should return a value', function () {
      addProperty(obj, 'test', function () { return 1; });

      expect(obj.test).to.be.equal(1);
    });

    it('should return null', function () {
      addProperty(obj, 'test', function () { return null; });

      expect(obj.test).to.be.null;
    });

    it('should return object on undefined', function () {
      addProperty(obj, 'test', function () { return undefined; });

      expect(obj.test).to.be.equal(obj);
    });

  });
});
