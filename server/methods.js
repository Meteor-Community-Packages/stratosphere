var SemVer = Meteor.npmRequire("semver-loose");
var fs = Meteor.npmRequire("fs");
var path = Meteor.npmRequire('path');
var crypto = Meteor.npmRequire('crypto');
var semver = Meteor.npmRequire('semver-loose');

/**
 * XXX split this up in smaller files
 */

_.mixin({
  toArrayFromObj: function (object, keyName)
  {
    return _.values(_.map(Object.keys(object),function (item)
    {
      object[item][keyName] = item;
      return object[item];
    }));
  }
});

/*
 * XXX nicer lodash alternative, see http://stackoverflow.com/questions/26155219/opposite-of-indexby-in-lodash-underscore

 _.mixin({
 disorder: function(collection, path) {
 return _.transform(collection, function(result, item, key) {
 if (path)
 _.set(item, path, key);

 result.push(item);
 }, []);
 }
 });
 */


function verifyHashes(files){
  for(var file in files){
    if(!files.hasOwnProperty(file))continue;
    if(!verifyHash(file,files[file])) return false;
  }
  return true;
}
function verifyHash(file,hash){
  var crypto = require('crypto');
  var hasher = crypto.createHash('sha256');
  hash.setEncoding('base64');
  //file = files.convertToOSPath(args[0]);

  var rs = fs.createReadStream(file)

  Async.runSync(function(done){ rs.on('end',done);rs.pipe(hasher, { end: false });});

  rs.close();
  return hasher.digest('base64') === hash;
}

/**
 * Synchronizer fetches new data from upstream package repository
 */
//Constructor function
function Synchronizer(){
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
Synchronizer.prototype.synchronize = function(){
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
      throw new Meteor.Error("Error while syncing with upstream package server: "+e);
    }
  }

  console.log('Finished syncing with upstream');
  return this.syncToken;
}

/**
 * Initialize or reset synchronization data
 * @private
 */
Synchronizer.prototype._init = function(){
  this.chunk =  0;
  this.remoteData = {upToDate:false,collections:{}};
  this.syncToken = Metadata.findOne({key:'syncToken'}).value;
  //delete this.syncToken._id;
}

/**
 * Initialize or reset synchronization data
 * @private
 */
Synchronizer.prototype._reset = function() {
  for (collectionName in this.collections) {
    if (!this.collections.hasOwnProperty(collectionName))continue;
    this.collections[collectionName].remove({private:false});
  }
}

/**
 * Fetch a part of the upstream data
 * @returns new upstream sync token
 */
Synchronizer.prototype._synchronizeChunk = function(){
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
Synchronizer.prototype._upsertChunk = function(){
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
Synchronizer.prototype._checkName = function(element,collectionName){
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
      element[nameKey] = element[nameKey] + "@UPSTREAM";
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
Synchronizer.prototype._addCustomFields = function(element){
  //To easily query versions, add an integer representation of the semver version
  if(element.hasOwnProperty("version")){
    element.versionMagnitude = versionMagnitude(element.version);
  }

  //Add other custom fields
  element.hidden = false;
  element.private = false;
}

function versionMagnitude(version){

  try{
    return versionMagnitude(PackageVersion.versionMagnitude(element.version));
  }catch(e){
    var v = SemVer.parse(semv);
    return v.major * 100 * 100 +
        v.minor * 100 +
        v.patch;
  }
}
/**
 * Set a package as published, this is after at least one version is published
 */
function publishPackage(name){
  check(name,String);

  var pack = Packages.findOne({name:name,private:true});

  if(pack){
    Packages.upsert(pack._id,{$set:{hidden:false, lastUpdated: new Date()}});
    return true;
  }
  return false;
}

var validatePackageName = function(){
  try{
    PackageVersion.validatePackageName(this.value);
    return true;
  }catch(e){
    return false;
  }
}
var validateVersion = function(){
  try{
    PackageVersion.getValidServerVersion(this.value);
    return true;
  }catch(e){
    return false;
  }
}

/**
 * Method parameter schemas
 */
var CreatePackageParameters = new SimpleSchema({
  'name': {
    type: String,
    custom:validatePackageName
  }
});

var ChangeVersionMetadataParameters = new SimpleSchema({
  'git': {
    type: String,
    optional:true
  },
  'description': {
    type: String,
    max:100
  },
  'longDescription': {
    type: String,
    max:1500,
    optional:true
  }
});
var SyncTokenSchema = new SimpleSchema({
  'lastDeletion': {
    type: Number
  },
  'format': {
    type: String
  },
  'packages': {
    type: Number
  },
  'versions': {
    type: Number
  },
  'builds': {
    type: Number
  },
  'releaseTracks': {
    type: Number
  },
  'releaseVersions': {
    type: Number
  },
  'stratosphere': {
    type: Boolean,
    optional:true,
    defaultValue:false
  },
  '_id': {
    type: String,
    optional:true
  }
});
var SyncOptionsSchema = new SimpleSchema({
      'compressCollections':{
        type: Boolean,
        optional:true,
        defaultValue:false
      },
      'useShortPages':{
        type: Boolean,
        optional:true,
        defaultValue:false
      }
    });

var VersionIdentifierSchema = new SimpleSchema({
  'packageName':{
    type: String,
    custom:validatePackageName
  },
  'version':{
    type: String,
    custom:validateVersion
  }
});

var CreatePackageBuildParameters = new SimpleSchema({
  'packageName':{
    type: String,
    custom:validatePackageName
  },
  'version':{
    type: String,
    custom:validateVersion
  },
  'buildArchitectures':{
    type:String
  }
});
var CreatePackageVersionParameters = new SimpleSchema({
  'packageName':{
    type:String,
    custom:validatePackageName
  },
  'version':{
    type:String,
    custom:validateVersion
  },
  'description':{
    type:String,
    max:100
  },
  'longDescription':{
    type:String,
    optional:true,
    max:1500
  },
  'git':{
    type:String,
    optional:true
  },
  'compilerVersion':{
    type:String
  },
  'containsPlugins':{
    type:Boolean
  },
  'debugOnly':{
    type:Boolean
  },
  'exports':{
    type:[Object],
    optional:true
  },
  'exports.$.name':{
    type:String
  },
  'exports.$.architectures':{
    type:[String]
  },
  'releaseName':{
    type:String
  },
  'dependencies':{
    type:[Object]
  },
  'dependencies.$.packageName':{
    type:String,
    optional:true
  },
  'dependencies.$.constraint':{
    type:String,
    optional:true
  },
  'dependencies.$.references':{
    type:[Object]
  },
  'dependencies.$.references.$.arch':{
    type:String
  }
});
var PackageVersionHashes = new SimpleSchema({
  'tarballHash':{
    type:String
  },
  'treeHash':{
    type:String
  },
  'readmeHash':{
    type:String
  }
});

function ensureLogin(){
  if(Meteor.settings.public.loginRequired && !Meteor.user()) throw new Meteor.Error("Action not authenticated");
}

function makePrivatePackage(data){
  CreatePackageParameters.clean(data);
  check(data,CreatePackageParameters);

  var pack = Packages.findOne(data);
  var insert;

  //We only allow to overwrite upstream packages
  if(pack && pack.private){
    throw new Meteor.Error("Private package already exists. To create a new version of an existing package, do not use the --create flag!");
  }

  var date = new Date();
  insert = {name:data.name, hidden:true, private:true, lastUpdated: date};

  //If an upstream package already exist, rename it with an "@UPSTREAM"-suffix
  if(pack){
    insert.upstream = pack._id;
    Packages.update(pack._id,{$set:{name:pack.name+"@UPSTREAM",lastUpdated:date}});
    Versions.update({packageName:pack.name},{$set:{packageName:pack.name+"@UPSTREAM",lastUpdated:date}});
  }

  insert.maintainers = [];
  if(Meteor.user()){
    insert.maintainers.push({username:Meteor.user().username,id:Meteor.userId()});
  }

  insert._id = Packages.insert(insert);

  return insert._id;

}

/**
 * Methods - exposes package server API to ddp clients (meteor tool)
 */
Meteor.methods({

  refresh:function(){
    ensureLogin();
    var synchronizer = new Synchronizer();
    synchronizer.synchronize();
  },

  /**
   * Create a package
   * Current behavior when a package already exists upstream is to rename the upstream package
   * by adding the "@UPSTREAM"-suffix
   */
  createPackage: function(data){
    ensureLogin();
    return makePrivatePackage(data);
  },

  /**
   * Unpublish a package
   * XXX: WIP
   * @param name
   * @returns {boolean}
   */
  unPublishPackage:function(data){
    CreatePackageParameters.clean(data);
    check(data,CreatePackageParameters);

    if(Meteor.settings.loginRequired && !Meteor.user()) return;

    var pack = Packages.findOne({name:data.name,private:true});
    if(!pack) throw new Meteor.Error('No such package, stratosphere can only unpublish private packages');

    Packages.remove(pack._id);
    Versions.remove({packageName:pack.name});
    Builds.remove({buildPackageName:pack.name});
    if(pack.upstream){
      var date = new Date();
      Packages.update({_id:pack.upstream},{$set:{name:pack.name,lastUpdated:date}})
      Versions.update({packageName:pack.name+"@UPSTREAM"},{$set:{packageName:pack.name,lastUpdated:date}});
    }
    Metadata.update({key:'lastDeletion'},{$set:{value:date.getTime()}});

    console.log("Unpublished package " + pack.name);
    return true;
  },

  /**
   * Update metadata of a package version
   *
   * @return success(boolean)?
   */
  changeVersionMetadata: function(versionIdentifier, data){
    ensureLogin();
    VersionIdentifierSchema.clean(versionIdentifier);
    check(versionIdentifier,VersionIdentifierSchema);

    ChangeVersionMetadataParameters.clean(data);
    check(data,ChangeVersionMetadataParameters);

    var pack = Packages.findOne({name:versionIdentifier.packageName,private:true});
    var version = Versions.findOne({packageName:versionIdentifier.packageName,version:versionIdentifier.version});
    if(!pack || !version) throw new Meteor.Error("Unknown private package or version");


    Versions.update(version._id,{$set:data});
    if(pack.latestVersion && pack.latestVersion.id === version._id){
      Packages.update(pack._id,{$set:{"latestVersion.description":version.description}});
    }

    console.log("Changed version metadata for version " + version._id);
    return true;

  },

  /**
   * Return all changes to the package DB since data provided in syncToken
   *
   *
   * @returns
   * {
   *  collections
   *  {
   *    packages(Array),
   *    versions(Array),
   *    builds(Array),
   *    releaseVersions(Array),
   *    releaseTracks(Array),
   *  },
   *  compressedCollections
   *  {
   *
   *  }
   *  syncToken
   *  {
   *    lastDeletion(long)
   *    format(semver String)
   *    packages(long)
   *    versions(long)
   *    builds(long)
   *    releaseTracks(long)
   *    releaseVersions(long)
   *    stratoSphere(Boolean)
   *    _id(integer)
   *  },
   *  upToDate(Boolean)
   *  resetData(Boolean)
   * }
   */
  syncNewPackageData: function(syncToken, syncOptions){
    ensureLogin();

    SyncTokenSchema.clean(syncToken);
    SyncOptionsSchema.clean(syncOptions);
    check(syncToken,SyncTokenSchema);
    check(syncOptions,SyncOptionsSchema);

    //XXX: check format version and do something with it

    //Set page limit
    var perPage = 500;
    if(syncOptions.useShortPages){
      perPage = 10;
    }

    //Sync with upstream
    var synchronizer = new Synchronizer();
    synchronizer.synchronize();

    //Bootstrap sync data
    var result = {collections:{},upToDate:true,resetData:false};
    var collections = {
      "packages":Packages,
      "versions":Versions,
      "builds":Builds,
      "releaseVersions":ReleaseVersions,
      "releaseTracks":ReleaseTracks
    };

    var lastDeletion = Metadata.findOne({key:'lastDeletion'}).value;

    //If the syncToken is from a non-stratosphere package server, reset everything??
    if(!syncToken.stratosphere || lastDeletion > syncToken.lastDeletion){
      result.resetData = true;
      syncToken.stratosphere = true;
      syncToken.lastDeletion = lastDeletion;
      for(var collectionName in collections)
        syncToken[collectionName] = 0;
    }

    result.syncToken = syncToken;


    for(var collectionName in collections){
      var cursor = collections[collectionName].rawCollection().find({hidden:false,lastUpdated:{$gt:new Date(syncToken[collectionName])}},{sort:{lastUpdated:1},fields:{latestVersion:0,upstream:0,private:0,hidden:0,buildPackageName:0,versionMagnitude:0}});

      var count = Async.runSync(function(done) {cursor.count(true,done);}).result;
      if(!count)continue;

      if(count > perPage){
        result.upToDate = false;
      }
      result.collections[collectionName] = Async.runSync(function(done){cursor.limit(perPage).toArray(done)}).result;

      //REVERT mongo-safe dependencies to the way meteor wants it.
      if(collectionName === 'versions'){
        _.map(result.collections[collectionName],function(elem){elem.dependencies = _.indexBy(elem.dependencies,'packageName')});
      }

      result.syncToken[collectionName] = new Date(result.collections[collectionName][result.collections[collectionName].length - 1].lastUpdated).getTime();
    }

    if(syncOptions.compressCollections){
      var zlib = Meteor.npmRequire('zlib');
      result.collectionsCompressed = zlib.Gzip(result.collections);
      delete result.collections;
    }

    return result;
  },

  /**
   * Create a certain build of a package?
   *
   * @returns
   * {
   *   uploadToken(String)
   *   uploadUrl(String)
   * }
   */
  createPackageBuild: function(data){
    ensureLogin();

    CreatePackageBuildParameters.clean(data);
    check(data,CreatePackageBuildParameters);

    var pack = Packages.findOne({name:data.packageName, private:true});
    var version = Versions.findOne({packageName:data.packageName,version:data.version});
    if(!pack || !version) throw new Meteor.Error("Unknown private package or version");

    var build = Builds.findOne({versionId:version._id,buildArchitectures:data.buildArchitectures});
    if(build) throw new Meteor.Error("Build already exists");

    var date = new Date();

    var insert = {
      buildArchitectures: data.buildArchitectures,
      versionId: version._id,
      lastUpdated: date,
      hidden:true,
      private: true,
      buildPackageName:data.packageName
    };
    insert._id = Builds.insert(insert);

    var token = {
      type:'build',
      typeId:insert._id,
      paths:{build:''},
      createdAt: date
    };
    token._id = UploadTokens.insert(token);

    console.log("Create package build " + insert._id);

    return {
      uploadToken: token._id,
      uploadUrl: Meteor.absoluteUrl() + 'upload/?token='+token._id+'&type=build'
    }
  },

  /**
   * Publish a build of package
   *
   * @param uploadToken(String)
   * @param tarballHash(String)
   * @param treeHash
   */
  publishPackageBuild: function(uploadToken,tarballHash,treeHash){
    ensureLogin();

    check(uploadToken,String);
    check(tarballHash,String);
    check(treeHash,String);

    var tokenData = UploadTokens.findOne({_id:uploadToken});
    if(!tokenData || tokenData.type !== 'build')
      throw new Meteor.Error("Invalid upload token");


    UploadTokens.remove({_id:uploadToken});
    var build = Builds.findOne({_id:tokenData.typeId});
    if(!build)
      throw new Meteor.Error("Invalid upload token");


    var builtBy = {};
    if(Meteor.user()){
      builtBy = {username:Meteor.user().username,id:Meteor.userId()};
    }
    var date = new Date();

    var update = {
      build:{
        treeHash: treeHash,
        tarballHash: tarballHash,
        url: Meteor.absoluteUrl() + 'upload/build/' + tokenData.typeId + '.tgz'
      },
      builtBy:builtBy,
      hidden:false,
      lastUpdated:date,
      buildPublished:date
    };
    Builds.update(tokenData.typeId,{$set:update});

    console.log("Published package build " + build._id);
    return true;
  },

  /**
   * Create a readme file for a certain package
   * XXX how to handle behavior when package already exists catalog?
   *
   * @param versionIdentifier
   * {
 *   packageName (string) - required
 *   version (semver string) - required
 * }
   */
  createReadme: function(versionIdentifier){
    VersionIdentifierSchema.clean(versionIdentifier);
    check(versionIdentifier,VersionIdentifierSchema);

    ensureLogin();

    var pack = Packages.findOne({name:versionIdentifier.packageName,private:true});
    var version = Versions.findOne({packageName:versionIdentifier.packageName,version:versionIdentifier.version});
    if(!pack || !version) throw new Meteor.Error("Unknown private package or version");

    var result = {uploadToken:'',url:''};

    var token = {
      type:'version',
      typeId:version._id,
      paths:{readme:''},
      createdAt: new Date()
    };

    token._id = UploadTokens.insert(token);
    result.uploadToken = token._id;
    result.url = Meteor.absoluteUrl() + 'upload/?token='+token._id+'&type=readme';
    console.log("Allow publication of readme for version "+version._id);
    return result;
  },

  /**
   * Publish a readme file
   *
   * @param uploadToken (String)
   *
   * @param options
   * {
   *  hash(String)
   * }
   *
   */
  publishReadme: function(uploadToken,options) {
    ensureLogin();
    check(uploadToken,String);
    check(options.hash,String);

    var tokenData = UploadTokens.findOne({_id:uploadToken});

    if(!tokenData || tokenData.type !== 'version') throw new Meteor.Error("Unknown upload token");

    var version = Versions.findOne({_id:tokenData.typeId});
    if(!version) throw new Meteor.Error("Unknown version data");

    //XXX: verify hash
    Versions.update({_id:version._id},{$set:{
      readme:{
        hash: options.hash,
        url: Meteor.absoluteUrl() + 'upload/version/' + tokenData.typeId + '_readme.md'
      },
      lastUpdated: new Date()
    }});
    console.log("Published readme for version "+version._id);
  },

  /**
   * Create a new package version
   *
   * @return
   * {
   *    uploadToken(String)
   *    readmeUrl(String)
   *    uploadUrl(String)
   * }
   */
  createPackageVersion: function(record){
    ensureLogin();
    record.dependencies = _.toArrayFromObj(record.dependencies,'packageName')
    CreatePackageVersionParameters.clean(record,{autoConvert:false,removeEmptyStrings:false});
    check(record,CreatePackageVersionParameters);

    var pack = Packages.findOne({name:record.packageName});
    var version = Versions.findOne({packageName:record.packageName,version:record.version});

    if(pack && !pack.private){
      console.log("Making package "+pack.name+" private");
      makePrivatePackage({name:pack.name});
    }

    if(!pack){
      throw new Meteor.error("Package does not exist");
    }

    if(version) throw new Meteor.error("Version already exists");

    var d = new Date();

    _.extend(record,{
      versionMagnitude:versionMagnitude(record.version),
      lastUpdated: new Date(),
      private:true,
      hidden:true
    });

    record._id = Versions.insert(record);

    var token = {
      type:'version',
      typeId:record._id,
      paths:{sources:'',readme:''},
      createdAt: d
    };

    token._id = UploadTokens.insert(token);

    console.log("Created package version "+record._id);
    return {
      uploadToken: token._id,
      uploadUrl: Meteor.absoluteUrl() + 'upload/?token='+token._id+'&type=sources',
      readmeUrl: Meteor.absoluteUrl() + 'upload/?token='+token._id+'&type=readme'
    }
  },

  /**
   * Publish version of a package
   */
  publishPackageVersion: function(uploadToken, hashes){
    ensureLogin();
    check(uploadToken,String);
    check(hashes,PackageVersionHashes);

    var tokenData = UploadTokens.findOne({_id:uploadToken});
    if(!tokenData || tokenData.type !== 'version'){
      throw new Meteor.Error("Invalid upload token");
    }

    UploadTokens.remove({_id:uploadToken});
    var version = Versions.findOne({_id:tokenData.typeId});
    if(!version){
      throw new Meteor.Error("Invalid upload token");
    }

    //XXX verify hashes?
    var publishedBy = {};

    var uploadUrlBase = Meteor.absoluteUrl();

    var pack = Packages.findOne({name:version.packageName});

    if(Meteor.user()){
        publishedBy = {username:Meteor.user().username,id:Meteor.userId()};

        var maintainer = {username:Meteor.user().username,id:Meteor.userId()};
        if(!pack.hasOwnProperty("maintainers")){
          Packages.update({name:version.packageName},{$set:{maintainers:[]}});
        }

        if(!_.pluck(pack.maintainers, 'username').indexOf(Meteor.user().username)){
          Packages.update({name:version.packageName},{$push:{maintainers:maintainer}});
        }

        insert.maintainers = [];
      }

    var date = new Date();
    //Cache latest version
    Packages.update({name:version.packageName},{$set:{latestVersion:{id:version._id,description:version.description,version:version.version,published:date}}});
    //Publish version
    Versions.update(version._id,{$set:{
        lastUpdated: date,
        published: date,
        publishedBy:publishedBy,
        hidden: false,
        source:{
          url: uploadUrlBase + 'upload/version/' + tokenData.typeId + '.tgz',
          tarballHash:hashes.tarballHash,
          treeHash:hashes.treeHash
        },
        readme:{
          url: uploadUrlBase + '/upload/version/' + tokenData.typeId + '_readme.md',
          hash:hashes.readmeHash
        }
      }});

    //If this is the first version published, publish the package
    if(pack.hidden){
        publishPackage(pack.name);
      }

    console.log("Published package version "+version._id);
    return true;
  }

});