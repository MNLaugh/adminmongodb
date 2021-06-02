//example dbUri with no authentication
var databaseUri = "mongodb://127.0.0.1:27017/webproxy";
 
//example dbUri with username and password for the database test
// var dbUri = "mongodb://username:pwd@127.0.0.1:27017/procmanager";
 
 
// var zipFilePath = "./backup/webproxy/webproxy_17_7_20.16.39.55/webproxy_17_7_20.16.39.55.zip";
 
// //this tells the module that your collections uses the default generated mongodb ObjectID.
// //default is true
// var useObjectID = false;
 
// var Restore = require("backup-mongodb-restorer");
 
// new Restore (databaseUri, zipFilePath, useObjectID).restore(); 

var restore = require('mongodb-restore')
restore({
  uri: databaseUri, // mongodb://<dbuser>:<dbpassword>@<dbdomain>.mongolab.com:<dbport>/<dbdatabase>
  root: './backups', // read tar file from this dir
  tar: 'webproxy.tar' // restore backup from this tar file
});