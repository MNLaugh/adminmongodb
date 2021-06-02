var express = require('express');
var router = express.Router();
var _ = require('lodash');
var path = require('path');
var common = require('./common');

// runs on all routes and checks password if one is setup
router.all('/db/*', common.checkLogin, function (req, res, next){
    next();
});

// create a new database
router.post('/database/:conn/db_create', function (req, res, next){
    var connection_list = req.app.locals.dbConnections;

    // Check for existance of connection
    if(connection_list[req.params.conn] === undefined){
        res.status(400).json({'msg': req.i18n.__('Invalid connection')});
        return;
    }

    // check for valid DB name
    if(req.body.db_name.indexOf(' ') >= 0 || req.body.db_name.indexOf('.') >= 0){
        res.status(400).json({'msg': req.i18n.__('Invalid database name')});
        return;
    }

    // Get DB form pool
    var mongo_db = connection_list[req.params.conn].native.db(req.body.db_name);

    // adding a new collection to create the DB
    mongo_db.collection('test').save({}, function (err, docs){
        if(err){
            console.error('Error creating database: ' + err);
            res.status(400).json({'msg': req.i18n.__('Error creating database') + ': ' + err});
        }else{
            res.status(200).json({'msg': req.i18n.__('Database successfully created')});
        }
    });
});

// delete a database
router.post('/database/:conn/db_delete', function (req, res, next){
    var connection_list = req.app.locals.dbConnections;

    // Check for existance of connection
    if(connection_list[req.params.conn] === undefined){
        res.status(400).json({'msg': req.i18n.__('Invalid connection')});
    }

    // Get DB form pool
    var mongo_db = connection_list[req.params.conn].native.db(req.body.db_name);

    // delete a collection
    mongo_db.dropDatabase(function (err, result){
        if(err){
            console.error('Error deleting database: ' + err);
            res.status(400).json({'msg': req.i18n.__('Error deleting database') + ': ' + err});
        }else{
            res.status(200).json({'msg': req.i18n.__('Database successfully deleted'), 'db_name': req.body.db_name});
        }
    });
});

// Backup a database
router.post('/database/:conn/:db/db_backup', function (req, res, next){
    //var mongodbBackup = require('mongodb-backup');
    var Backup = require("backup-mongodb");
    var MongoURI = require('mongo-uri');
    var connection_list = req.app.locals.dbConnections;

    // Check for existance of connection
    if(connection_list[req.params.conn] === undefined){
        res.status(400).json({'msg': req.i18n.__('Invalid connection')});
    }

    // get the URI
    var conn_uri = MongoURI.parse(connection_list[req.params.conn].connString);
    var db_name = req.params.db;

    var uri = connection_list[req.params.conn].connString;

    // add DB to URI if not present
    if(!conn_uri.database){
        uri = uri + '/' + db_name;
    }
    console.log(uri, path.join(__dirname, '../backups'))
    // kick off the backup
    try {
        new Backup(uri, path.join(__dirname, '../backups')).backup();
        res.status(200).json({'msg': req.i18n.__('Database successfully backed up')});
    } catch(e) {
        console.error('Backup DB error: ' + e);
        res.status(400).json({'msg': req.i18n.__('Unable to backup database')});
    }
    // mongodbBackup({uri: uri, root: path.join(__dirname, '../backups'), /*tar: db_name + '.tar',*/ callback: function(err){
        // if(err){
            // console.error('Backup DB error: ' + err);
            // res.status(400).json({'msg': req.i18n.__('Unable to backup database')});
        // }else{
            // res.status(200).json({'msg': req.i18n.__('Database successfully backed up')});
        // }
    // }});
});

var restore = require("backup-mongodb-restorer");
// Restore a database
router.post('/database/:conn/:db/db_restore', async function (req, res, next){
    var MongoURI = require('mongo-uri');
    //var mongodbRestore = require('mongodb-restore');
    
    var connection_list = req.app.locals.dbConnections;
    var dropTarget = false;
    if(req.body.dropTarget === true || req.body.dropTarget === false){
        dropTarget = req.body.dropTarget;
    }

    // Check for existance of connection
    if(connection_list[req.params.conn] === undefined){
        res.status(400).json({'msg': req.i18n.__('Invalid connection')});
    }

    // get the URI
    var conn_uri = MongoURI.parse(connection_list[req.params.conn].connString);
    var backup_name = req.params.db
    var db_name = backup_name.split("_")[0];
    var uri = connection_list[req.params.conn].connString;

    // add DB to URI if not present
    if(!conn_uri.database){
        uri = uri + '/' + db_name;
    }

    // kick off the restore
    try {
        await restore(uri, path.join(__dirname, `../backups/${backup_name}/${backup_name}.zip`));
        res.status(200).json({'msg': req.i18n.__('Database successfully restored')});
    } catch(e) {
        console.error('Restore DB error: ' + e);
        res.status(400).json({'msg': req.i18n.__('Unable to restore database')});
    }
});

module.exports = router;
