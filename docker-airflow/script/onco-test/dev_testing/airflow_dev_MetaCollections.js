/* 
  testing environment - airflow
  Mongo Cluster - dev
*/

var jsonfile = require("jsonfile");
var comongo = require('co-mongodb');
var co = require('co');
var mongoose = require("mongoose");
var db, collection;
var onerror = function(e){
    console.log(e);
};

co(function *() {

  db = yield comongo.client.connect('mongodb://oncoscapeRead:i1f4d9botHD4xnZ'+
    '@oncoscape-dev-db1.sttrcancer.io:27017,oncoscape-dev-db2.sttrcancer.io:27017,'+
    'oncoscape-dev-db3.sttrcancer.io:27017/tcga?authSource=admin&replicaSet=rs0');
  collections = yield comongo.db.collections(db);
  var allCollectionNames = collections.map(function(m){return m.s.name;});
  console.log(allCollectionNames.length);
  jsonfile.writeFile("/usr/local/airflow/docker-airflow/onco-test/dev-allCollectionNames.json", allCollectionNames, function(err){console.error(err);});
  
  collection = yield comongo.db.collection(db, "manifest");
  var manifest_arr = yield collection.find({}).toArray();
  jsonfile.writeFile("/usr/local/airflow/docker-airflow/onco-test/dev-manifest_all.json", manifest_arr, {spaces: 2}, function(err){console.error(err);});
  manifest_arr = manifest_arr.filter(function(m){return m.source == "tcga" || m.source == "ucsc xena"});
  collection = yield comongo.db.collection(db, "lookup_oncoscape_datasources");
  var lookup_arr = yield collection.find({}).toArray();
  collection = yield comongo.db.collection(db, "render_pca");
  var render_pca = yield collection.find({}).toArray();
  collection = yield comongo.db.collection(db, "render_patient");
  var render_patient = yield collection.find({}).toArray();
  collection = yield comongo.db.collection(db, "lookup_dataTypes");
  var lookup_dataTypes = yield collection.find({}).toArray();
  jsonfile.writeFile("/usr/local/airflow/docker-airflow/onco-test/dev-manifest_arr.json", manifest_arr, {spaces: 2}, function(err){ console.error(err);});  
  jsonfile.writeFile("/usr/local/airflow/docker-airflow/onco-test/dev-lookup_arr.json", lookup_arr, {spaces: 2}, function(err){ console.error(err);});  
  jsonfile.writeFile("/usr/local/airflow/docker-airflow/onco-test/dev-render_pca.json", render_pca, {spaces: 2}, function(err){ console.error(err);});  
  jsonfile.writeFile("/usr/local/airflow/docker-airflow/onco-test/dev-render_patient.json", render_patient, {spaces: 2}, function(err){ console.error(err);});  
  jsonfile.writeFile("/usr/local/airflow/docker-airflow/onco-test/dev-lookup_dataTypes.json", lookup_dataTypes, {spaces: 2}, function(err){ console.error(err);});  

  yield comongo.db.close(db);
}).catch(onerror);


