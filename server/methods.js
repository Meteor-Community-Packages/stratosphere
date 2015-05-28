var SemVer = Meteor.npmRequire("semver-loose");

/**
 * Create an integer representation of a semver, for mongo query sorting
 * @param semv SemVer
 * @returns Integer representation of semv
 */
function getVersionInt(semv){
  semv = SemVer.parse(semv);

  return semv.major*100 + semv.minor*10 + semv.patch;
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
    return SyncTokens.findOne({});

  console.log('Start syncing with upstream');

  //Initialize data
  this._reset();

  while(!this.remoteData.upToDate) {
    try {
        this._synchronizeChunk();
    }catch(e){
      console.log("Error while syncing with upstream package server: "+e);
      break;
    }
  }

  console.log('Finished syncing with upstream');
  return this.syncToken;
}

/**
 * Initialize or reset synchronization data
 * @private
 */
Synchronizer.prototype._reset = function(){
  this.chunk =  0;
  this.remoteData = {upToDate:false,collections:{}};
  this.syncToken = SyncTokens.findOne({});
  delete this.syncToken._id;
}

/**
 * Fetch a part of the upstream data
 * @returns new upstream sync token
 */
Synchronizer.prototype._synchronizeChunk = function(){
  console.log('Import upstream chunk '+ ++this.chunk);
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

  this._upsertChunk();

  this.syncToken = this.remoteData.syncToken;
  SyncTokens.update({},{$set:this.syncToken});
}

/**
 * Upsert a chunk of remote data in our database
 * @private
 */
Synchronizer.prototype._upsertChunk = function(){
  var collectionName,collection,element,i;
  for(collectionName in this.collections){
    if(!this.collections.hasOwnProperty(collectionName) || !this.remoteData.collections.hasOwnProperty(collectionName))continue;

    collection = this.remoteData.collections[collectionName];
    for(i = 0; i < collection.length; i++){
      element = collection[i];
      //If a custom package already exist, then modify the upstream one to reflect this
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
 * Check if a custom package with given name already exist, then modify the upstream one to reflect this
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
        for(dependency in element.dependencies){
          element.dependencies[dependency.replace(/\./g,'\uff0e')] = element.dependencies[dependency];
          delete element.dependencies[dependency];
        }
      }
      break;
  }
  if(checkName){
    query = {custom:true};
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
    element.versionInt = getVersionInt(element.version);
  }

  //Add other custom fields
  element.hidden = false;
  element.custom = false;
}

/**
 * Set a package as published, this is after at least one version is published
 */
function publishPackage(name){
  check(name,String);

  var pack = Packages.findOne({name:name,custom:true});

  if(pack){
    Packages.upsert(pack._id,{$set:{hidden:false, lastUpdated: new Date()}});
    return true;
  }
  return false;
}

/**
 * Methods - exposes package server API to ddp clients (meteor tool)
 */
Meteor.methods({

  refresh:function(){
    var synchronizer = new Synchronizer();
    synchronizer.synchronize();
  },

  /**
   * Create a package
   * Current behavior when a package already exists upstream is to rename the upstream package
   * by adding the "@UPSTREAM"-suffix
   *
   * @param name
   */
  createPackage: function(name){
    //XXX better validation
    check(name,String);
    if(Meteor.settings.loginRequired && !Meteor.user()) return;

    var pack = Packages.findOne({name:name});
    var insert;

    //We only allow to overwrite upstream packages
    if(pack && pack.custom){
      return;
    }

    var date = new Date();
    insert = {name:name, hidden:true, custom:true, lastUpdated: date};

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
  },

  /**
   * Unpublish a package
   * XXX: WIP
   * @param name
   * @returns {boolean}
   */
  unPublishPackage:function(name){
    check(name,String);
    if(Meteor.settings.loginRequired && !Meteor.user()) return;

    var pack = Packages.findOne({name:packageName,custom:true});
    if(!pack)return true;

    Packages.remove(pack._id);
    Versions.remove({packageName:pack.name});
    Builds.remove({buildPackageName:pack.name});
    if(pack.upstream){
      var date = new Date();
      Packages.update({_id:pack.upstream},{$set:{name:pack.name,lastUpdated:date}})
      Versions.update({packageName:pack.name+"@UPSTREAM"},{$set:{packageName:pack.name,lastUpdated:date}});
    }

  },

  /**
   * Update metadata of a package version
   *
   * @param versionIdentifier - required
   * {
 *   packageName (string) - required
 *   version (semver string) - required
 * }
   * @param dataToUpdate - required
   * {
 *   git(string) - optional
 *   description(string) - required
 *   longDescription(string) - optional
 * }
   *
   * @return success(boolean)?
   */
  changeVersionMetaData: function(versionIdentifier,dataToUpdate){
    //XXX Better validation
    check(versionIdentifier.packageName,String);
    check(versionIdentifier.version,String);
    if(Meteor.settings.loginRequired && !Meteor.user()) return;

    var pack = Packages.findOne({name:versionIdentifier.packageName,custom:true});
    if(!pack)return false;

    var version = Versions.findOne({packageName:versionIdentifier.packageName,version:versionIdentifier.version});

    if(version){
      Versions.update(version._id,{$set:dataToUpdate});
      if(pack.latestVersion && pack.latestVersion.id === version._id){
        Packages.update(pack._id,{$set:{"latestVersion.description":version.description}});
      }
      return true;
    }
    return false;
  },

  /**
   * Return all changes to the package DB since data provided in syncToken
   *
   * @param syncToken - contains data when last synced
   * {
   *    lastDeletion(Long)
   *    format(String)
   *    packages(Long)
   *    versions(Long)
   *    builds(Long)
   *    releaseTracks(Long)
   *    releaseVersions(Long)
   *    stratosphere(Boolean)
   *    _id(integer)
   * }
   *
   * @param syncOptions - some tions that I don't really know how to handle yet
   * {
   *  compressCollections(Boolean) - XXX no idea what this does
   *  useShortPages(Boolean) - XXX no idea what this does
   * }
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
    //XXX Better validation
    if(Meteor.settings.loginRequired && !Meteor.user()) return;

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

    //XXX If the syncToken is from a non-stratosphere package server, reset everything??
    /*if(!syncToken.hasOwnProperty("stratosphere")){
      result.resetData = true;
      syncToken.stratosphere = true;
      for(var collectionName in collections)
        syncToken[collectionName] = 0;
    }*/

    result.syncToken = syncToken;


    for(var collectionName in collections){
      var cursor = collections[collectionName].rawCollection().find({hidden:false,lastUpdated:{$gte:new Date(syncToken[collectionName])}},{sort:{lastUpdated:1},fields:{latestVersion:0,upstream:0,custom:0,hidden:0,buildPackageName:0,versionInt:0}});

      var count = Async.runSync(function(done) {cursor.count(true,done);}).result;
      if(count > perPage){
        result.upToDate = false;
      }
      result.collections[collectionName] = Async.runSync(function(done){cursor.limit(perPage).toArray(done)}).result;
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
   * @param data
   * {
 *   packageName (string) - required
 *   version (semver string) - required
 *   buildArchitectures (XXX array?) -
 * }
   * @returns
   * {
 *   uploadToken(String)
 *   uploadUrl(String)
 * }
   */
  createPackageBuild: function(data){
    if(Meteor.settings.loginRequired && !Meteor.user()) return;

    var pack = Packages.findOne({name:data.packageName,custom:true});
    var version = Versions.findOne({packageName:data.packageName,version:data.version});
    if(pack && version){
      var build = Builds.findOne({versionId:version._id,buildArchitectures:data.buildArchitectures});
      if(build)return false;

      var date = new Date();
      var insert = {
          buildArchitectures: data.buildArchitectures,
          versionId: version._id,
          lastUpdated: date,
          hidden:true,
          custom: true,
          buildPackageName:data.packageName
        };

      insert._id = Builds.insert(insert);
      var token = {typeId:insert._id, type:'build', url:'', createdAt: date};
      token._id = UploadTokens.insert(token);

      return {
        uploadToken: token._id,
        uploadUrl: ''
      }
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
    if(Meteor.settings.loginRequired && !Meteor.user()) return;

    var tokenData = UploadTokens.findOne({_id:uploadToken});
    if(tokenData && tokenData.type === 'build'){
      UploadTokens.remove(uploadToken);
      var build = Builds.findOne({_id:tokenData.typeId});

      if(!build)
        return false;

      var builtBy = {};
      if(Meteor.user()){
        builtBy = {username:Meteor.user().username,id:Meteor.userId()};
      }

      var date = new Date();

      var update = {
        build:{
          treeHash: treeHash,
          tarballHash: tarballHash,
          url: tokenData.url
        },
        builtBy:builtBy,
        hidden:false,
        lastUpdated:date,
        buildPublished:date
      };

      Builds.update(tokenData.typeId,{$set:update});
    }
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
    //XXX Validation
    if(Meteor.settings.loginRequired && !Meteor.user()) return;

    var pack = Packages.findOne({name:versionIdentifier.packageName,custom:true});
    var version = Versions.findOne({packageName:versionIdentifier.packageName,version:versionIdentifier.version});
    var result = {uploadToken:''};
    if(version && pack){
      var token = {type:'readme', typeId:version._id, url:'', createdAt:new Date()};
      token._id = UploadTokens.insert(token);
      result.uploadToken = token._id;
    }
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
    ///XXX Validation
    if(Meteor.settings.loginRequired && !Meteor.user()) return;

    var tokenData = UploadTokens.findOne({_id:uploadToken});
    if(tokenData && tokenData.type === 'readme' && tokenData.url.length){
      UploadTokens.remove({_id:uploadToken});
      var version = Versions.findOne({_id:tokenData.typeId});
      if(!version){
        //XXX delete readme file
        return false;
      }
      //XXX verify hash?
      Versions.update({_id:version._id},{$set:{
        readme:{
          hash: options.hash,
          url: tokenData.url
        },
        lastUpdated: new Date()
      }});
      return true;
    }
    return false;
  },

  /**
   * Create a new package version
   *
   * @param record
   * {
 *    packageName(String)
 *    version(Semver String)
 *    description(String)
 *    longDescription(String)
 *    git(String)
 *    compilerVersion(String)
 *    containsPlugins(XXX Arrray?)
 *    debugOnly(XXX Boolean?)
 *    exports(XXX Exports?)
 *    releaseName(String),
 *    dependencies(XXX Array?)
 * }
   *
   * @return
   * {
 *    uploadToken(String)
 *    readmeUrl(String)
 *    uploadUrl(String)
 * }
   */
  createPackageVersion: function(record){
    //XXX Validation
    if(Meteor.settings.loginRequired && !Meteor.user()) return;

    var pack = Packages.findOne({name:versionIdentifier.packageName,custom:true});
    var version = Versions.findOne({packageName:record.packageName,version:record.version});
    if(!pack || version)return false;

    var d = new Date();

    _.extend(record,{
      versionInt:getVersionInt(record.version),
      lastUpdated: new Date(),
      custom:true,
      hidden:true
    });

    record._id = Versions.insert(record);

    var token = {type:'version', typeId:record._id, url:'', createdAt: d};

    token._id = UploadTokens.insert(token);

    return {
      uploadToken: token._id,
      uploadUrl: '',
      readmeUrl: ''
    }
  },

  /**
   * Publish version of a package
   *
   * @param uploadToken (String)
   * XXX The token that identifies the uploaded tarball?
   *
   * @param hashes
   * {
 *   tarballHash(String)
 *   treeHash(String)
 *   readmeHash(String)
 * }
   * XXX to verify the tarball?
   */
  publishPackageVersion: function(uploadToken, hashes){
    if(Meteor.settings.loginRequired && !Meteor.user()) return;

    var tokenData = UploadTokens.findOne({_id:uploadToken});
    if(tokenData && tokenData.type === 'version' && tokenData.url.length){

      UploadTokens.remove({_id:uploadToken});
      var version = Versions.findOne({_id:tokenData.typeId});
      if(!version){
        //XXX delete uploaded file
        return false;
      }

      //XXX verify hashes?

      var publishedBy = {};

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
          url:tokenData.url,
          tarballHash:hashes.tarballHash,
          treeHash:hashes.treeHash
        }
      }});
      //If this is the first version published, publish the package
      if(pack.hidden){
        publishPackage(pack.name);
      }

      return true;
    }
    return false;
  }

});