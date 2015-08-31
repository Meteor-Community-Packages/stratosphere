/**
 * Synchronizer fetches new data from upstream package repository
 */
//Constructor function
class Synchronizer{

}


function(){
  if (!(this instanceof Synchronizer))
    return new Synchronizer();
}

// Static data
Synchronizer.prototype.syncOptions = {compressCollections:false,useShortPages:false};
Synchronizer.prototype.collections = {
  "packages":Packages,
  "versions":Versions,
  "builds":Builds,
  "releaseVersions":ReleaseVersions,
  "releaseTracks":ReleaseTracks
};

/**
 * Fetch new data from upstream package repository
 * @returns new upstream sync token
 */
Synchronizer.prototype.synchronize = function synchronize(){
  //If there is no connection to an upstream server, we cannot synchronize
  if(!Stratosphere.UpstreamConn || !Stratosphere.UpstreamConn.status().connected)
    return Metadata.findOne({key:"syncToken"}).value;

  console.log('Start syncing with upstream');

  //Initialize data
  this._init();

  while(!this.remoteData.upToDate) {
    try {
      this._synchronizeChunk();
    }catch(e){
      throw new Meteor.Error(`Error while syncing with upstream package server: ${e}`);
    }
  }

  console.log('Finished syncing with upstream');
  return this.syncToken;
}

/**
 * Initialize or reset synchronization data
 * @private
 */
Synchronizer.prototype._init = function _init(){
  this.chunk =  0;
  this.remoteData = {upToDate:false,collections:{}};
  this.syncToken = Metadata.findOne({key:'syncToken'}).value;
  //delete this.syncToken._id;
}

/**
 * Initialize or reset synchronization data
 * @private
 */
Synchronizer.prototype._reset = function _reset() {
  for (collectionName in this.collections) {
    if (!this.collections.hasOwnProperty(collectionName))continue;
    this.collections[collectionName].remove({private:false});
  }
}

/**
 * Fetch a part of the upstream data
 * @returns new upstream sync token
 */
Synchronizer.prototype._synchronizeChunk = function _synchronizeChunk(){
  console.log('Fetch upstream chunk '+ ++this.chunk);
  //Fetch a chunk of data
  this.remoteData = Stratosphere.UpstreamConn.call('syncNewPackageData', this.syncToken, {});
  /*
   XXX: Support compressed collections
   if (remoteData.collectionsCompressed) {
   var colsGzippedBuffer = new Buffer(remoteData.collectionsCompressed, 'base64');
   var fut = new Future;
   zlib.gunzip(colsGzippedBuffer, fut.resolver());
   var colsJSON = fut.wait();
   remoteData.collections = JSON.parse(colsJSON);
   delete remoteData.collectionsCompressed;
   }
   */

  if(this.remoteData.resetData){
    console.log('Reset datastore as per upstream command');
    this._reset();
  }

  if(_.size(this.remoteData.collections)){
    this._upsertChunk();
  }

  this.syncToken = this.remoteData.syncToken;
  Metadata.update({key:'syncToken'},{$set:{value:this.syncToken}});

  var lastDeletion = Metadata.findOne({key:'lastDeletion'}).value;
  if(lastDeletion < this.syncToken.lastDeletion){
    Metadata.update({key:'lastDeletion'},{$set:{value:this.syncToken.lastDeletion}});
  }
}

/**
 * Upsert a chunk of remote data in our database
 * @private
 */
Synchronizer.prototype._upsertChunk = function _upsertChunk(){
  console.log('Import upstream chunk '+ this.chunk);

  var collectionName,collection,element,i;
  for(collectionName in this.collections){
    if(!this.collections.hasOwnProperty(collectionName) || !this.remoteData.collections.hasOwnProperty(collectionName))continue;

    collection = this.remoteData.collections[collectionName];
    for(i = 0; i < collection.length; i++){
      element = collection[i];
      //If a private package already exist, then modify the upstream one to reflect this
      this._checkName(element,collectionName);

      /*
       XXX Cache latest version information (for front-end performance)
       if(collectionName === "versions"
       && (!pack.latestVersion || new Date(pack.latestVersion.lastUpdated).getTime() < new Date(element.lastUpdated).getTime())){
       Packages.update(pack._id,{
       $set:{
       hidden:false,
       latestVersion:{
       version:element.version,
       id:element._id,
       description:element.description,
       lastUpdated:element.lastUpdated
       }
       }});
       }*/
      this._addCustomFields(element);

      //Upsert into the collection
      this.collections[collectionName].upsert(element._id,{$set:element});
    }
  }
}

/**
 * Check if a private package with given name already exist, then modify the upstream one to reflect this
 * @param element
 * @private
 */
Synchronizer.prototype._checkName = function _checkName(element,collectionName){
  var query;
  var date = new Date();
  var checkName = false;
  var nameKey = '';
  switch(collectionName){
    case 'packages':
      checkName = true;
      nameKey = 'name';
      break;
    case 'versions':
      checkName = true;
      nameKey = 'packageName';
      //Sanitize for MongoDB
      if(element.hasOwnProperty("dependencies")){

        //Make dependencies MONGO-safe (remove dots from key names by transforming into array)
        element.dependencies = _.toArrayFromObj(element.dependencies, 'packageName');

        /*
         XXX Alternative: replace key with unicode variant, better or not?
         for(dependency in element.dependencies){
         element.dependencies[dependency.replace(/\./g,'\uff0e')] = element.dependencies[dependency];
         delete element.dependencies[dependency];
         }*/
      }
      break;
  }
  if(checkName){
    query = {private:true};
    query[nameKey] = element[nameKey];
    var pack = Packages.findOne(query);
    if(pack){
      element[nameKey] = element[nameKey] + "-UPSTREAM";
      element.lastUpdated = date;
      if(collectionName === "packages"){
        Packages.update(pack._id,{$set:{upstream:element._id}});
      }
    }
  }
}

/**
 * Add custom fields to element, i.e. fields not present in upstream
 * @param element
 * @private
 */
Synchronizer.prototype._addCustomFields = function _addCustomFields(element){
  //To easily query versions, add an integer representation of the semver version
  if(element.hasOwnProperty("version")){
    element.versionMagnitude = Stratosphere.utils.versionMagnitude(element.version);
  }

  //Add other custom fields
  element.hidden = false;
  element.private = false;
}

