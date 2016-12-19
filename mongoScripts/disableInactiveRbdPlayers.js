db = db.getSiblingDB('bbofans_prod');
cursor = db.members.find({
  $and: [
          { isRbdPlayer: true },
          { $or: [
                   { 'rbd.totalScores.numTournaments': 0 },
                   { 'rbd.lastPlayedAt': { $lt: ISODate('2016-01-01T00:00:00Z') }},
                 ]
          },
          { $or: [
                   { 'rock.totalScores.numTournaments': 0 },
                   { 'rock.lastPlayedAt': { $lt: ISODate('2016-01-01T00:00:00Z') }},
                 ]
          },
          { isEnabled: true }, { isBanned: false }, { isBlackListed: false }
        ]
  });
print('bboName,name');
cursor.forEach(function (p) {
  print('"' + p.bboName + '","' + p.name + '"');
  db.members.update( { '_id': p._id }, { $set: { isEnabled: false }});
});
