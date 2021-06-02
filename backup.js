const dbs = ['procmanager', 'webproxy', 'wildduck', 'zone-mta']

var dbUri = "mongodb://127.0.0.1:27017/";
var basePath = "./backup/";
var Backup = require("backup-mongodb");

const dbname = 'wildduck'

dbUri += dbname
basePath += dbname
new Backup(dbUri, basePath).backup()
/*const Back = dbname => {
	dbUri += dbname
	basePath += dbname
    new Backup(dbUri, basePath).backup()
}

dbs.forEach(name => Back(name))*/