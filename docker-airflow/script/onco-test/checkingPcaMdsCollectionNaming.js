const mongoose = require("mongoose");
const u = require("underscore");
const helper = require("/usr/local/airflow/docker-airflow/onco-test//testingHelper.js");
const asyncLoop = require('node-async-loop');
const jsonfile = require("jsonfile");
var collection, lookup_oncoscape_datasources, genesets, data;
var lookup_oncoscape_datasources = require("/usr/local/airflow/docker-airflow/onco-test//lookup_arr.json");
var connection = mongoose.connection;

mongoose.connect(
    'mongodb://oncoscape-prod-db1.sttrcancer.io:27017,oncoscape-prod-db2.sttrcancer.io:27017,oncoscape-prod-db3.sttrcancer.io:27017/tcga?authSource=admin', {
        db: {
            native_parser: true
        },
        server: {
            poolSize: 5,
            reconnectTries: Number.MAX_VALUE
        },
        replset: {
            rs_name: 'rs0'
        },
        user: 'oncoscapeRead',
        pass: 'CTp6DtfRNWfFLUP'
    });

var fetchAPIData = function(db, filename, query=null){
  return new Promise(function(resolve, reject){
  	db.collection(filename).find(query).toArray().then(function(response){
  		resolve(response);
  	});   
  });
};

connection.once('open', function(){
    var db = connection.db; 
    asyncLoop(lookup_oncoscape_datasources, function(lookupDoc, next){ 
    	if('edges' in lookupDoc){
    		var networkNames = lookupDoc.edges.map(function(m){return m.collection;}).unique();
    		if(networkNames.length > 1){
    			console.log(lookupDoc.disease, " edges has multiple collections.");
    		}
    		var networkName = networkNames[0];
    		fetchAPIData(db, networkName).then(function(response){
    			console.log("data received");
    			data = response;
    			
    			//Compare network data with LookupDoc.edges field
    			var allKeys = Object.keys(u.groupBy(data, 'input'));
    			var lookupEdges = u.countBy(lookupDoc.edges.map(function(m){return u.omit(m, 'collection', 'source');}), 'dataType');
    			console.log(u.difference(u.values(lookupEdges), [6, 6, 6, 6]).length == 0);
    			console.log(u.difference(Object.keys(lookupEdges), allKeys.filter(function(m){
    				return !(m.indexOf(",") > -1);
    			})).length == 0);
    			//Compare network data with LookupDoc.molecular field
    			var data_partial = data.filter(function(m){
    				return m.default;
    			}).map(function(m){return u.omit(m, "_id", "disease", "source","alteration", "d");});
    			var defaultKeys = Object.keys(u.groupBy(data_partial, 'input'));

    			var molecularDefaultCollections =  lookupDoc.molecular.filter(function(m){return m.default == true;}).map(function(m){return m.type;}).unique();
    			console.log(u.difference( defaultKeys.filter(function(m){return !(m.indexOf(',')>-1);}), molecularDefaultCollections).length == 0 ); 
    			var genesets = Object.keys(u.countBy(data_partial, 'geneset'));
    			console.log(genesets.length == 6);
    			genesets.forEach(function(geneset){
    				console.log(u.countBy(data_partial, 'geneset')[geneset] == 7);
    				console.log(u.difference(u.values(u.countBy(data_partial.filter(function(m){
    					return m.geneset == geneset;
     				}), 'dataType')), [5, 1, 1]).length == 0);
    			});	
    		});
    	}else{	
    		console.log(lookupDoc.disease, " doesn't have 'edges' field.");
    	}
    	//next();
    }, function (err)
      {
          if (err)
          {
              console.error('Error: ' + err.message);
              return;
          }
          console.log('Finished!');
      });
});





