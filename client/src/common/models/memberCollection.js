var Backbone = require('backbone');
var Member = require('./member');

MemberCollection = Backbone.Collection.extend({
  url: "admin/member",
  model: Contact,
  comparator: "bboName"
});

var API = {
  getMemberEntities: function(){
    var contacts = new MemberCollection();
    var defer = $.Deferred();
    contacts.fetch({
      success: function(data){
        defer.resolve(data);
      }
    });
    return defer;
  },

  getMemberEntity: function(memberId){
    var contact = new Member({id: memberId});
    var defer = $.Deferred();
    contact.fetch({
      success: function(data){
        defer.resolve(data);
      },
      error: function(data){
        defer.resolve(undefined);
      }
    });
    return defer;
  }
};

ContactManager.reqres.setHandler("member:entities", function(){
  return API.getMemberEntities();
});

ContactManager.reqres.setHandler("member:entity", function(id){
  return API.getMemberEntity(id);
});

module.exports = MemberCollection;
