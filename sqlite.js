'use strict';
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./db.sqlite', function(err, resp) {
  console.log('db opened', err, resp);
});

var tables = [
  'CREATE TABLE lorem (info TEXT)',
  `CREATE TABLE "devices" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    _id TEXT,
    deviceLibraryIdentifier TEXT,
    serialNumber TEXT,
    passTypeIdentifier TEXT,
    authorization TEXT,
    docType TEXT,
    type TEXT)`
];
db.serialize(function() {
  tables.forEach(function(table) {
    db.run(table);
  });


  var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
  for (var i = 0; i < 10; i++) {
    stmt.run("Ipsum " + i);
  }
  stmt.finalize();

  db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
    console.log(row.id + ": " + row.info);
  });
});

db.close();
