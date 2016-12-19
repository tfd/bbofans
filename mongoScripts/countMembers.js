db = db.getSiblingDB('bbofans_prod');
print('total playes: ' + db.members.find({ isEnabled: true, isBanned: false, isBlackListed: false }).count());
print('total rbd playes: ' + db.members.find({ isEnabled: true, isBanned: false, isBlackListed: false, isRbdPlayer: true }).count());
print('total rock playes: ' + db.members.find({ isEnabled: true, isBanned: false, isBlackListed: false, isRbdPlayer: false }).count());
print('no games: ' + db.members.find({
  $and: [
          { 'rock.totalScores.numTournaments' : 0 },
          { $or : [
                    { 'rbd.totalScores.numTournaments' : 0 },
                    { isRbdPlayer: false }
                  ]
          },
          { isEnabled: true }, { isBanned: false }, { isBlackListed: false }
        ]
  }).count());
print('no rbd games: ' + db.members.find({'rbd.totalScores.numTournaments' : 0, 'rock.totalScores.numTournaments' : 0, isEnabled: true, isBanned: false, isBlackListed: false, isRbdPlayer: true}).count());
print('no rock games: ' + db.members.find({'rock.totalScores.numTournaments' : 0, isEnabled: true, isBanned: false, isBlackListed: false, isRbdPlayer: false}).count());
print('active players: ' + db.members.find({
  $and: [
          {
             $or: [
                    {
                      $and: [
                              { isRbdPlayer: true },
                              { 'rbd.lastPlayedAt': { $gte: ISODate('2016-01-01T00:00:00Z') }},
                              { 'rbd.totalScores.numTournaments': { $gt: 0 }}
                            ]
                    },
                    {
                      $and: [
                              { 'rock.lastPlayedAt': { $gte: ISODate('2016-01-01T00:00:00Z') }},
                              { 'rock.totalScores.numTournaments': { $gt: 0 }}
                            ]
                    }
                  ]
          },
          { isEnabled: true }, { isBanned: false }, { isBlackListed: false }
        ]
  }).count());
print('active rbd players: ' + db.members.find({
  $and: [
          { isRbdPlayer: true },
          {
             $or: [
                    {
                      $and: [
                              { 'rbd.lastPlayedAt': { $gte: ISODate('2016-01-01T00:00:00Z') }},
                              { 'rbd.totalScores.numTournaments': { $gt: 0 }}
                            ]
                    },
                    {
                      $and: [
                              { 'rock.lastPlayedAt': { $gte: ISODate('2016-01-01T00:00:00Z') }},
                              { 'rock.totalScores.numTournaments': { $gt: 0 }}
                            ]
                    }
                  ]
          },
          { isEnabled: true }, { isBanned: false }, { isBlackListed: false }
        ]
  }).count());
print('active rock players: ' + db.members.find({
  isRbdPlayer: false,
  'rock.lastPlayedAt': { $gte: ISODate('2016-01-01T00:00:00Z') },
  'rock.totalScores.numTournaments': { $gt: 0 },
  isEnabled: true, isBanned: false, isBlackListed: false}).count());
print('inactive players: ' + db.members.find({
  $and: [
          { $or: [
                   { isRbdPlayer: false },
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
  }).count());
print('inactive rbd players: ' + db.members.find({
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
  }).count());
print('inactive rock players: ' + db.members.find({
  $and: [
          { isRbdPlayer: false },
          { $or: [
                   { 'rock.totalScores.numTournaments': 0 },
                   { 'rock.lastPlayedAt': { $lt: ISODate('2016-01-01T00:00:00Z') }},
                 ]
          },
          { isEnabled: true }, { isBanned: false }, { isBlackListed: false }
        ]
  }).count());