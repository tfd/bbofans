/* jshint -W030 */
var addMethod = require('../../src/utils/chai/addMethod');

describe('addMethod function', function () {

  var obj;

  beforeEach(function () {
    obj = {};
  });

  it('should exist', function () {
    expect(addMethod).to.be.a('function');
  });

  it('should add a method to the object', function () {
    expect(obj).to.not.respondTo('test');

    addMethod(obj, 'test', function () {});

    expect(obj).to.respondTo('test');
    expect(obj.test).to.be.a('function');
  });

  describe('added function', function () {

    it('should return the object on default', function () {
      addMethod(obj, 'test', function () {});

      expect(obj.test()).to.be.equal(obj);
    });

    it('should return a value', function () {
      addMethod(obj, 'test', function () { return 1; });

      expect(obj.test()).to.be.equal(1);
    });

    it('should return a value or the object', function () {
      addMethod(obj, 'test', function (i) { if (i === 1) return 1 ; });

      expect(obj.test()).to.be.equal(obj);
      expect(obj.test(1)).to.be.equal(1);
    });

    it('should return null', function () {
      addMethod(obj, 'test', function () { return null; });

      expect(obj.test()).to.be.null;
    });

    it('should return object on undefined', function () {
      addMethod(obj, 'test', function () { return undefined; });

      expect(obj.test()).to.be.equal(obj);
    });

  });
});
