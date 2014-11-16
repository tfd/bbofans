var Backbone = require('backbone');
var bbofansApp = require('../../bbofans');

var TdModel = Backbone.Model.extend();
var TdCollection = Backbone.Collection.extend({
  model: TdModel
});

var API = {
  getDefaultCollection: function () {
    var tds = new TdCollection();
    tds.add([{
      src: '/img/tds/pensando3.jpg',
      alt: 'Pensando',
      caption: '<h5>Pensando</h5>Italy'
    },{
      src: '/img/tds/ann.jpg',
      alt: 'Annc8',
      caption: '<h5>Annc8</h5>U.S.A.'
    },{
      src: '/img/tds/Bdchats.jpg',
      alt: 'Bdchats',
      caption: '<h5>Bdchats</h5>India'
    },{
      src: '/img/tds/leon1971.jpg',
      alt: 'Grey Cat',
      caption: '<h5>Grey Cat</h5>Israel'
    },{
      src: '/img/tds/nlelos.jpg',
      alt: 'Lelos80te',
      caption: '<h5>Lelos80te</h5>Poland'
    },{
      src: '/img/tds/BenAkiba.jpg',
      alt: 'BenAkiba',
      caption: '<h5>BenAkiba</h5>Serbia'
    },{
      src: '/img/tds/1anik.jpg',
      alt: '1Anik',
      caption: '<h5>1Anik</h5>Poland'
    },{
      src: '/img/tds/kenya3.jpg',
      alt: 'Kenya3',
      caption: '<h5>Kenya3</h5>Kenya'
    },{
      src: '/img/tds/arcitect.jpg',
      alt: 'Arcitect',
      caption: '<h5>Arcitect</h5>Turkey'
    },{
      src: '/img/tds/sanjoy.jpg',
      alt: 'Sankuban',
      caption: '<h5>Sankuban</h5>India'
    },{
      src: '/img/tds/spiros.jpg',
      alt: 'Spiros 33',
      caption: '<h5>Spiros 33</h5>Greece'
    },{
      src: '/img/tds/willic.jpg',
      alt: 'Willic',
      caption: '<h5>Willic</h5>Germany'
    },{
      src: '/img/tds/0carboncanada.jpg',
      alt: '0 carbon',
      caption: '<h5>0 carbon</h5>Canada'
    },{
      src: '/img/tds/karacayli9.jpg',
      alt: 'Karacayli9',
      caption: '<h5>Karacayli9</h5>Turkey'
    }]);

    return tds;
  }
};

bbofansApp.reqres.setHandler('td:getPictures', function () {
  return API.getDefaultCollection();
});

module.exports = TdCollection;
