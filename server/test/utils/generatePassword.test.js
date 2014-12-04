/* jshint -W030 */
var GeneratePassword = require('../../src/utils/generatePassword');

describe('GeneratePassword', function () {

  var generatePassword;

  beforeEach(function () {
    generatePassword = new GeneratePassword();
  });

  it('should exist', function () {
    expect(GeneratePassword).to.be.a('function');
  });

  describe('get method', function () {
  
    it('should exist', function () {
      expect(generatePassword.get).to.be.a('function');
    });

    it('should return an empty string', function () {
      expect(generatePassword.get()).to.equal('');
    });

  });

  describe('lowercase property', function () {
  
    it('should exist', function () {
      expect(generatePassword).has.property('lowercase');
    });

    it('should generate a lowercase letter', function () {
      var pwd = generatePassword.lowercase.get();

      console.log(pwd);
      expect(pwd).to.have.length(1);
      expect('abcdefghijklmnopqrstuvwxyz').to.contain(pwd);
    });
  });

  describe('uppercase property', function () {
  
    it('should exist', function () {
      expect(generatePassword).has.property('uppercase');
    });

    it('should generate a uppercase letter', function () {
      var pwd = generatePassword.uppercase.get();

      console.log(pwd);
      expect(pwd).to.have.length(1);
      expect('ABCDEFGHIJKLMNOPQRSTUVWXYZ').to.contain(pwd);
    });
  });

  describe('letter property', function () {
  
    it('should exist', function () {
      expect(generatePassword).has.property('letter');
    });

    it('should generate a letter', function () {
      var pwd = generatePassword.letter.get();

      console.log(pwd);
      expect(pwd).to.have.length(1);
      expect('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ').to.contain(pwd);
    });
  });

  describe('numbers property', function () {
  
    it('should exist', function () {
      expect(generatePassword).has.property('numbers');
    });

    it('should generate a numbers character', function () {
      var pwd = generatePassword.numbers.get();

      console.log(pwd);
      expect(pwd).to.have.length(1);
      expect('0123456789').to.contain(pwd);
    });
  });

  describe('punctuation property', function () {
  
    it('should exist', function () {
      expect(generatePassword).has.property('punctuation');
    });

    it('should generate a punctuation character', function () {
      var pwd = generatePassword.punctuation.get();

      console.log(pwd);
      expect(pwd).to.have.length(1);
      expect('!:?;,.').to.contain(pwd);
    });
  });

  describe('brackets property', function () {
  
    it('should exist', function () {
      expect(generatePassword).has.property('brackets');
    });

    it('should generate a brackets character', function () {
      var pwd = generatePassword.brackets.get();

      console.log(pwd);
      expect(pwd).to.have.length(1);
      expect('()[]{}').to.contain(pwd);
    });
  });

  describe('apostrophes property', function () {
  
    it('should exist', function () {
      expect(generatePassword).has.property('apostrophes');
    });

    it('should generate a apostrophes character', function () {
      var pwd = generatePassword.apostrophes.get();

      console.log(pwd);
      expect(pwd).to.have.length(1);
      expect('\'"`').to.contain(pwd);
    });
  });

  describe('math property', function () {
  
    it('should exist', function () {
      expect(generatePassword).has.property('math');
    });

    it('should generate a math character', function () {
      var pwd = generatePassword.math.get();

      console.log(pwd);
      expect(pwd).to.have.length(1);
      expect('+-*/<>=%').to.contain(pwd);
    });
  });

  describe('others property', function () {
  
    it('should exist', function () {
      expect(generatePassword).has.property('others');
    });

    it('should generate a others character', function () {
      var pwd = generatePassword.others.get();

      console.log(pwd);
      expect(pwd).to.have.length(1);
      expect('@#$^&_\\|~').to.contain(pwd);
    });
  });

  describe('least method', function () {

    it('should exist', function () {
      expect(generatePassword.least).to.be.a('function');
    });

    it('should create a password of the given length', function () {
      var pwd = generatePassword.least(3).lowercase.get();

      expect(pwd).to.have.length(3);
    });

  });

  describe('most method', function () {

    it('should exist', function () {
      expect(generatePassword.most).to.be.a('function');
    });

    it('should create a password of the given length', function () {
      var pwd = generatePassword.most(3).lowercase.get();

      console.log(pwd.length);
      expect(pwd.length).to.be.below(4);
    });

  });

  describe('between method', function () {

    it('should exist', function () {
      expect(generatePassword.between).to.be.a('function');
    });

    it('should create a password of the given length', function () {
      var pwd = generatePassword.between(3, 5).lowercase.get();

      console.log(pwd.length);
      expect(pwd.length).to.be.above(2);
      expect(pwd.length).to.be.below(6);
    });

  });

  describe('exactly method', function () {

    it('should exist', function () {
      expect(generatePassword.exactly).to.be.a('function');
    });

    it('should create a password of the given length', function () {
      var pwd = generatePassword.between(3, 5).exactly(2).lowercase.get();

      expect(pwd.length).to.equal(2);
    });

  });

  describe('shuffle property', function () {

    it('should exist', function () {
      expect(generatePassword).to.have.a.property('shuffle');
    });

    it('should shuffle the password', function () {
      var pwd = generatePassword.exactly(8).lowercase.get();
      var shuffled = generatePassword.shuffle.get();

      console.log(pwd + ' ' + shuffled);
      expect(shuffled.length).to.equal(8);
      expect(shuffled).to.not.be.equal(pwd);
    });

  });

});