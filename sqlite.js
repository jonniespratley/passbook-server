'use strict';
/*&
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




*/



var elements = [
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'two',
  'five'
];
var result;
console.log('elements', elements);


/**
 * isFirstElementNull - O(1) - describes an algorithm that will always execute in the same time (or space) regardless of the size of the input data set.
 *
 * @param  {Array} elements   An array of elements
 * @return {Boolean}          True or false
 */
function isFirstElementNull(elements) {
  return elements[0] === null;
}
result = isFirstElementNull(elements);
console.log('isFirstElementNull', result);



/**
 * containsValue - O(n) - describes an algorithm whose performance will grow linearly and in direct proportion to the size of the input data set.
 *
 * @param  {Array} elements   An array of elements
 * @param  {String} value     The value of match
 * @return {Boolean}          True or false
 */
function containsValue(elements, value) {
  var matches, i = 0,
    len = elements.length;
  for (; i < len; i++) {
    matches = (elements[i] === value);
    if (matches) {
      return true;
    }
  }
  return false;
}
result = containsValue(elements, 'three');
console.log('containsValue', result);

/*
O(N2) represents an algorithm whose performance is directly proportional to the square of the size of the input data set.
This is common with algorithms that involve nested iterations over the data set.
Deeper nested iterations will result in O(N3), O(N4) etc.
*/


/**
 * containsDuplicates - O(n2) - represents an algorithm whose performance is directly proportional to the square of the size of the input data set.
 *
 * @param  {Array} elements   An array of elements
 * @return {Boolean}          True or false
 */
function containsDuplicates(elements) {
  var len = elements.length, val;
  for (var i = 0; i < len; i++) {
    val = elements[i];
    for (var j = 0; j < len; j++) {
      if(i !== j){
        if(val === elements[j]){
          return true;
        }
      }
    }
  }
  return false;
}

console.log('containsDuplicates', containsDuplicates(elements));
console.assert(containsDuplicates(elements) === true, 'has duplicates');
console.assert(containsDuplicates([1,2,3,4,5]) === false, 'has 0 duplicates');
