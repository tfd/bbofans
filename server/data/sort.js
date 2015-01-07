var fs = require('fs');
var obj = JSON.parse(fs.readFileSync('countries.json', 'utf8'));
obj.sort();
console.log(JSON.stringify(obj, null, 2));
