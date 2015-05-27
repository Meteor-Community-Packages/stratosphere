/**
 * Fetch packages from upstream package repository
 * @returns {*}
 */
function synchronize(){
  var syncToken = SyncTokens.findOne({});

  if(Stratosphere.UpstreamConn)
    return syncToken;

  console.log('Start syncing with upstream');

  var remoteData = {upToDate:false,collections:{}};
  var syncOpts = {compressCollections:false,useShortPages:false};
  var chunk = 0;
  delete syncToken._id;

  //var Future = Meteor.npmRequire('fibers/future');
  //var zlib = Meteor.npmRequire('zlib');

  while(!remoteData.upToDate){
    try{
      console.log('Import upstream chunk '+ ++chunk);

      //Fetch some data
      remoteData = Stratosphere.UpstreamConn.call('syncNewPackageData', syncToken, {});

      /*XXX:
       if (remoteData.collectionsCompressed) {
        var colsGzippedBuffer = new Buffer(remoteData.collectionsCompressed, 'base64');
        var fut = new Future;
        zlib.gunzip(colsGzippedBuffer, fut.resolver());
        var colsJSON = fut.wait();
        remoteData.collections = JSON.parse(colsJSON);
        delete remoteData.collectionsCompressed;
      }*/

      var collections = {
        "packages":Packages,
        "versions":Versions,
        "builds":Builds,
        "releaseVersions":ReleaseVersions,
        "releaseTracks":ReleaseTracks
      };
      var date = new Date();
      var checkName = false;
      var nameKey = '';
      for(var collectionName in collections){
        if(!collections.hasOwnProperty(collectionName) || !remoteData.collections.hasOwnProperty(collectionName))continue;

        var collection = remoteData.collections[collectionName];
        for(var i = 0; i < collection.length; i++){
          var element = collection[i];
          checkName = false;

          //If a custom package already exist, then modify the upstream one to reflect this
          switch(collectionName){
            case 'packages':
              checkName = true;
              nameKey = 'name';
              break;
            case 'versions':
              checkName = true;
              nameKey = 'packageName';
              if(element.hasOwnProperty("dependencies")){
                for(dependency in element.dependencies){
                  element.dependencies[dependency.replace(/\./g,'\uff0e')] = element.dependencies[dependency];
                  delete element.dependencies[dependency];
                }
              }
              break;
          }
          if(checkName){
            var query = {custom:true};
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

          //To easily query versions, add an integer representation of the semver version
          if(element.hasOwnProperty("version")){
            element.versionInt = parseInt(element.version.replace(/\./g,''));
          }

          //Add custom fields
          element.hidden = false;
          element.custom = false;

          //Upsert into the collection
          collections[collectionName].upsert(element._id,{$set:element});
        }
      }

      //Save new synctoken
      syncToken = remoteData.syncToken;
      SyncTokens.update({},{$set:syncToken});
    }catch(e){
      console.log("Upstream sync error "+e);
      break;
    }
  }

  console.log('Finished syncing with upstream');
  return syncToken;
}

/**
 * Methods - exposes package server API to ddp clients (meteor installations)
 */
Meteor.methods({

  refresh: function(){
    if(Meteor.settings.loginRequired && !Meteor.user()) return;
    synchronize();
  },

  /**
   * Create a package
   * XXX how to handle behavior when package already exists catalog?
   *     current strategy is to change the custom flag
   *
   *
   * @param name
   */
  createPackage: function(name){
    check(name,String);
    if(Meteor.settings.loginRequired && !Meteor.user()) return;

    //XXX validate and sanitize data
    var pack = Packages.findOne({name:name});
    var isCustom = isCustomPackage(pack);
    var insert;

    if(pack && isCustom){
      return;
    }

    var date = new Date();
    insert = {name:name, hidden:true, custom:true, lastUpdated: date};

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

  publishPackage: function(name){
    check(name,String);
    if(Meteor.settings.loginRequired && !Meteor.user()) return;

    var pack = Packages.findOne({name:name,custom:true});

    if(pack){
      Packages.upsert(pack._id,{$set:{hidden:false, lastUpdated: new Date()}});
      return true;
    }
    return false;
  },

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
    check(versionIdentifier.packageName,String);
    check(versionIdentifier.version,String);
    if(Meteor.settings.loginRequired && !Meteor.user()) return;

    //XXX validate and sanitize data

    var pack = Packages.findOne({name:versionIdentifier.packageName,custom:true});
    if(!pack)return false;

    var version = Versions.findOne({packageName:versionIdentifier.packageName,version:versionIdentifier.version});

    if(version){
      Versions.update(version._id,{$set:dataToUpdate});
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
    if(Meteor.settings.loginRequired && !Meteor.user()) return;

    //XXX: check format version and do something with it

    //Set page limit
    var perPage = 500;
    if(syncOptions.useShortPages){
      perPage = 10;
    }

    //Sync with upstream
    synchronize();

    //Bootstrap sync data
    var result = {collections:{},upToDate:true,resetData:false};
    var collections = {
      "packages":Packages,
      "versions":Versions,
      "builds":Builds,
      "releaseVersions":ReleaseVersions,
      "releaseTracks":ReleaseTracks
    };

    //XXX If the syncToken is from a non-stratosphere package server, reset everything
    /*if(!syncToken.hasOwnProperty("stratosphere")){
      result.resetData = true;
      syncToken.stratosphere = true;
      for(var collectionName in collections)
        syncToken[collectionName] = 0;
    }*/

    result.syncToken = syncToken;

    //var promises = [];

    for(var collectionName in collections){
      var cursor = collections[collectionName].find({hidden:false,lastUpdated:{$gte:new Date(syncToken[collectionName])}});
      var count = cursor.count();
      if(count > perPage){
        result.upToDate = false;
      }

      result.collections[collectionName] = collections[collectionName].find({hidden:false,lastUpdated:{$gte:new Date(syncToken[collectionName])}},{limit:perPage,sort:{lastUpdated:1},fields:{newestVersionAt:0,upstream:0,custom:0,hidden:0,buildPackageName:0,versionInt:0}}).fetch();
      result.syncToken[collectionName] = new Date(result.collections[collectionName][result.collections[collectionName].length - 1].lastUpdated).getTime();


      /*
      XXX: using rawcollection might be more efficient, but dirtier

      var dataFetched = Q.defer();
      var counted = Q.defer();
      promises.push(dataFetched.promise);
      promises.push(counted.promise);

      var cursor = collections[collectionName].rawCollection().find({hidden:false,lastUpdated:{$gte:new Date(syncToken[collectionName])}}).sort({lastUpdated:1}).limit(perPage);

      var count = cursor.count(true,function(err,count){
        if(count > perPage){
          result.upToDate = false;
        }
        counted.resolve();
      });

      result.collections[collectionName] = [];
      cursor.toArray(function(err, documents) {
        result.collections[collectionName] = documents;
        dataFetched.resolve();
      });

      result.syncToken[collectionName] = new Date(result.collections[collectionName][result.collections[collectionName].length - 1].lastUpdated).getTime();
      */
    }

    if(syncOptions.compressCollections){
      var zlib = Meteor.npmRequire('zlib');
      result.collectionsCompressed = zlib.Gzip(result.collections);
      delete result.collections;
    }

    return result;

    /*
    XXX: for when we use raw collections
    var future = new Future();
    return Q.all(promises).then(function(){
      if(syncOptions.compressCollections){
        var zlib = Meteor.npmRequire('zlib');
        result.collectionsCompressed = zlib.Gzip(result.collections);
        delete result.collections;
      }
      future.return();
    });

    return future.wait();
    */

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
    if(Meteor.settings.loginRequired && !Meteor.user()) return;

    var pack = Packages.findOne({name:versionIdentifier.packageName,custom:true});
    var version = Versions.findOne({packageName:record.packageName,version:record.version});
    if(!pack || version)return false;

    var d = new Date();

    _.extend(record,{
      versionInt:parseInt(record.version.replace(/\./g,'')),
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

      var publishedBy = {};

      if(Meteor.user()){
        publishedBy = {username:Meteor.user().username,id:Meteor.userId()};
        var pack = Packages.findOne({name:version.packageName});
        var maintainer = {username:Meteor.user().username,id:Meteor.userId()};
        if(!pack.hasOwnProperty("maintainers")){
          Packages.update({name:version.packageName},{$set:{maintainers:[]}});
        }

        if(!_.pluck(pack.maintainers, 'username').indexOf(Meteor.user().username)){
          Packages.update({name:version.packageName},{$push:{maintainers:maintainer}});
        }

        insert.maintainers = [];
      }

      //XXX verify hashes?
      var date = new Date();
      Packages.update({name:version.packageName},{$set:{newestVersionAt:date}});
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

      return true;
    }
    return false;
  }

});