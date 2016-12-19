db = db.getSiblingDB('bbofans_prod');
today = new Date();
year = today.getFullYear();
month = today.getMonth() - 5;
if (month < 0) {
  year = year - 1;
  month = 13 + month; 
}
lastPlayed = new Date(year, month, 1, 0, 0, 0, 0);
cursor = db.members.find({
  $and: [
          { isRbdPlayer: true },
          { 'rbd.lastPlayedAt': { $lt: lastPlayed }},
          { isEnabled: true }, { isBanned: false }, { isBlackListed: false }
        ]
  }).sort({ bboName: 1});
print("bboName,name,lastPlayed")
cursor.forEach(function (p) {
  print('"' + p.bboName + '","' + p.name + '",' + p.rbd.lastPlayedAt.toISOString());
  db.members.update( { '_id': p._id }, { $set: { isRbdPlayer: false }});
});