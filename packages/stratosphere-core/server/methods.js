/**
 * Set a package as published, this is after at least one version is published
 */
function publishPackage(name){
  var params = {name:name}
  Stratosphere.schemas.CreatePackageSchema.clean(params);
  check(params,Stratosphere.schemas.CreatePackageSchema);
  return Packages.upsert({name:params.name,private:true},{$set:{hidden:false, lastUpdated: new Date()}});
}

/**
 * Make an existing package private
 * @param data
 * @returns {*|any}
 */
function makePrivatePackage(data){
  return makePrivateX('package',data);
}

function makePrivateTrack(data){
  return makePrivateX('track',data);
}

/**
 * Make an existing package private
 * @param data
 * @returns {*|any}
 */
function makePrivateX(target,data){
  var targets = {
    'package' : {
      collection: Packages,
      childCollection: Versions,
      childReference: 'packageName',
      schema: Stratosphere.schemas.CreatePackageSchema
    },
    'track' : {
      collection: ReleaseTracks,
      childCollection: ReleaseVersions,
      childReference: 'track',
      schema: Stratosphere.schemas.CreateReleaseTrackParameters
    }
  }

  targets[target].schema.clean(data);
  check(data,targets[target].schema);

  var record = targets[target].collection.findOne(data);
  var insert;

  if(record && record.private)
    throw new Meteor.Error("Private "+ target +" already exists.");

  var date = new Date();
  insert = {name:data.name, hidden:true, private:true, lastUpdated: date};

  //If an upstream record already exist, rename it with an "-UPSTREAM"-suffix
  if(record){
    console.log("Renaming existing public " + target);
    insert.upstream = record._id;
    targets[target].collection.update(record._id,{$set:{name:record.name+"-UPSTREAM",lastUpdated:date}});

    var childQuery = {};
    childQuery[targets[target].childReference] = record.name;

    var childUpdate = {lastUpdated:date};
    childUpdate[targets[target].childReference] = record.name+"-UPSTREAM";
    targets[target].childCollection.update(childQuery,{$set:childUpdate},{multi:true});
  }

  insert.maintainers = [];
  if(Meteor.user()){
    insert.maintainers.push({username:Meteor.user().username,id:Meteor.userId()});
  }

  insert._id = targets[target].collection.insert(insert);

  return insert._id;
}

function addMaintainerToX(id,username,target){
  var targets = {
    'package' : Packages,
    'track' : ReleaseTracks
  }

  var params = {
    name:id,
    username:username
  };
  Stratosphere.schemas.ModifyMaintainerSchema.clean(params);
  check(params,Stratosphere.schemas.ModifyMaintainerSchema);

  var maintainer = {username:params.username}; //XXX: retrieve user
  console.log('Adding user from maintainer list');
  if(!targets[target].update({name:params.name,private:true},{ $push: { maintainers: maintainer }}))
    throw new Meteor.Error('404', 'Private '+ target +' not found!');
}

function removeMaintainerFromX(id,username,target){
  var targets = {
    'package' : Packages,
    'track' : ReleaseTracks
  };

  var params = {
    name:id,
    username:username
  };
  Stratosphere.schemas.ModifyMaintainerSchema.clean(params);
  check(params,Stratosphere.schemas.ModifyMaintainerSchema);

  console.log('Removing user from maintainer list');
  if(!targets[target].update({name:id,private:true},{ $pull: { maintainers: {username:maintainer.username} }}))
    throw new Meteor.Error('404', 'Private '+ target +' not found!');
}

function setRecommendationStatus(name,version,recommended){
  var params = {
    track: name,
    version: version,
    recommended: recommended
  }
  Stratosphere.schemas.RecommendVersionSchema.clean(params);
  check(params,Stratosphere.schemas.RecommendVersionSchema);
  console.log('Changing release version recommendation state');
  if(!ReleaseVersions.update({track:params.track,version:params.version,private:true},{$set:{recommended:params.recommended,lastUpdated:new Date()}}))
    throw new Meteor.Error('404', 'Private release version not found');
}

/**
 * Methods - exposes package server API to ddp clients (meteor tool)
 */
Meteor.methods({

  refresh:function(){
    Stratosphere.utils.checkAccess();
    var synchronizer = new Synchronizer();
    synchronizer.synchronize();
  },

  /**
   * Create a package
   * Current behavior when a package already exists upstream is to rename the upstream package
   * by adding the "-UPSTREAM"-suffix
   */
  createPackage: function(data){
    Stratosphere.utils.checkAccess();
    return makePrivatePackage(data);
  },

  /**
   * Unpublish a package
   * @param id
   * @returns {boolean}
   */
  unPublishPackage:function(id){
    Stratosphere.utils.checkAccess();
    check(id,String);

    var pack = Packages.findOne({_id:id,private:true});
    if(!pack) throw new Meteor.Error('No such private package, stratosphere can only unpublish private packages');

    Packages.remove(pack._id);
    Versions.remove({packageName:pack.name});
    Builds.remove({buildPackageName:pack.name});
    if(pack.upstream){
      var date = new Date();
      Packages.update({_id:pack.upstream},{$set:{name:pack.name}});
      Versions.update({packageName:pack.name+"-UPSTREAM"},{$set:{packageName:pack.name}},{multi:true});
    }
    Metadata.update({key:'lastDeletion'},{$set:{value:date.getTime()}});

    var wrench = Npm.require('wrench');
    var fs = Npm.require('fs');
    var path = Npm.require('path');
    var targets = ['version','build'];

    for(var i = 0; i < targets.length; i++){
      var destination = path.join(Meteor.settings.directories.uploads,targets[i],pack._id);
      if(fs.existsSync(destination))
        wrench.rmdirSyncRecursive(destination);
    }

    console.log("Unpublished package " + pack.name);
    return true;
  },

  /**
   * Add a maintainer to a package
   */
  addMaintainer:function(pack,username){
    Stratosphere.utils.checkAccess();
    addMaintainerToX(pack,username,'package');
  },

  /**
   * Remove a maintainer from a package
   */
  removeMaintainer:function(pack,username){
    Stratosphere.utils.checkAccess();
    removeMaintainerFromX(pack,params.username,'package');
  },

  /**
   * Add a maintainer to a version
   */
  addReleaseMaintainer:function(track,username){
    Stratosphere.utils.checkAccess();
    addMaintainerToX(track,username,'track');
  },

  /**
   * Remove a maintainer from a version
   */
  removeReleaseMaintainer:function(track,username){
    Stratosphere.utils.checkAccess();
    removeMaintainerFromX(track,username,'track');
  },

  /**
   * Recommend a version
   */
  recommendVersion:function(name,version){
    Stratosphere.utils.checkAccess();
    setRecommendationStatus(name,version,true);
  },

  /**
   * Unrecommend a version
   */
  unrecommendVersion:function(name,version){
    Stratosphere.utils.checkAccess();
    setRecommendationStatus(name,version,false);
  },

  /**
   * Change a package homepage
   */
  _changePackageHomepage:function(name,url){
    Stratosphere.utils.checkAccess();
    var params = {name:name,homepage:url};
    Stratosphere.schemas.ChangePackageHomepageSchema.clean(params);
    check(params,Stratosphere.schemas.ChangePackageHomepageSchema);
    console.log('Changing package homepage');
    if(!Packages.update({name:params.name,private:true},{$set:{homepage:params.homepage,lastUpdated:new Date()}}))
      throw new Meteor.Error('404','Package not found');
  },

  /**
   * Change version migration status
   */
  _changeVersionMigrationStatus:function(name,version,migrated){
    Stratosphere.utils.checkAccess();
    var params = {
      packageName:name,
      version:version,
      unmigrated:!migrated
    };
    Stratosphere.schemas.ChangeVersionMigrationStatusSchema.clean(params);
    check(params,Stratosphere.schemas.ChangeVersionMigrationStatusSchema);
    console.log('Changing version migration state');
    if(!Versions.update({packageName:params.packageName,version:params.version,private:true},{$set:{unmigrated:params.unmigrated}}))
      throw new Meteor.Error('404','Private version not found');

  },

  /**
   * Create a release track
   */
  createReleaseTrack:function(data){
    Stratosphere.utils.checkAccess();
    makePrivateTrack(data);
  },

  /**
   * Create a release version
   * {
   *   track,
   *   version,
   *   orderKey,
   *   description,
   *   recommended,
   *   tool,
   *   packages
   * };
   */
  createReleaseVersion:function(record){
    Stratosphere.utils.checkAccess();
    Stratosphere.schemas.CreateReleaseVersionSchema.clean(record);
    check(Stratosphere.schemas.CreateReleaseVersionSchema,record);
    //XXX
  },

  /**
   * Create a patch release version
   */
  createPatchReleaseVersion:function(record,patchFrom){
    Stratosphere.utils.checkAccess();
    //XXX
    Meteor.call('createPatchReleaseVersion',record);
  },

  /**
   * setBannersOnReleases
   */
  setBannersOnReleases:function(track,banners){
    Stratosphere.utils.checkAccess();
    //XXX
  },


  /**
   * Update metadata of a package version
   *
   * @return success(boolean)?
   */
  changeVersionMetadata: function(versionIdentifier, data){
    Stratosphere.utils.checkAccess();
    Stratosphere.schemas.VersionIdentifierSchema.clean(versionIdentifier);
    check(versionIdentifier,Stratosphere.schemas.VersionIdentifierSchema);

    Stratosphere.schemas.ChangeVersionMetadataParameters.clean(data);
    check(data,Stratosphere.schemas.ChangeVersionMetadataParameters);

    var pack = Packages.findOne({name:versionIdentifier.packageName,private:true});
    var version = Versions.findOne({packageName:versionIdentifier.packageName,version:versionIdentifier.version, private:true});

    if(!pack || !version)
      throw new Meteor.Error("Unknown private package or version");

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
    Stratosphere.utils.checkAccess();

    Stratosphere.schemas.SyncTokenSchema.clean(syncToken);
    Stratosphere.schemas.SyncOptionsSchema.clean(syncOptions);
    check(syncToken,Stratosphere.schemas.SyncTokenSchema);
    check(syncOptions,Stratosphere.schemas.SyncOptionsSchema);

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
      var cursor = collections[collectionName].rawCollection().find({/*hidden:false,*/lastUpdated:{$gt:new Date(syncToken[collectionName])}},{sort:{lastUpdated:1},fields:{latestVersion:0,upstream:0,private:0,hidden:0,buildPackageName:0,versionMagnitude:0}});

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
    Stratosphere.utils.checkAccess();

    Stratosphere.schemas.CreatePackageBuildParameters.clean(data);
    check(data,Stratosphere.schemas.CreatePackageBuildParameters);

    var pack = Packages.findOne({name:data.packageName, private:true});
    var version = Versions.findOne({packageName:data.packageName,version:data.version, private:true});
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
      packageId:pack._id,
      paths:{build:''},
      createdAt: date
    };
    token._id = UploadTokens.insert(token);

    console.log("Create package build " + insert._id);

    return {
      uploadToken: token._id,
      uploadUrl: Meteor.settings.public.url + '/upload/?token='+token._id+'&type=build'
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
    Stratosphere.utils.checkAccess();

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
        url: Meteor.settings.public.url + '/upload/build/' + tokenData.typeId + '.tgz'
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
    Stratosphere.schemas.VersionIdentifierSchema.clean(versionIdentifier);
    check(versionIdentifier,Stratosphere.schemas.VersionIdentifierSchema);

    Stratosphere.utils.checkAccess();

    var pack = Packages.findOne({name:versionIdentifier.packageName,private:true});
    var version = Versions.findOne({packageName:versionIdentifier.packageName,version:versionIdentifier.version});
    if(!pack || !version) throw new Meteor.Error("404","Unknown private package or version");

    var result = {uploadToken:'',url:''};

    var token = {
      type:'version',
      typeId:version._id,
      packageId:pack._id,
      paths:{readme:''},
      createdAt: new Date()
    };

    token._id = UploadTokens.insert(token);
    result.uploadToken = token._id;
    result.url = Meteor.settings.public.url + '/upload/?token='+token._id+'&type=readme';

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
    Stratosphere.utils.checkAccess();
    check(uploadToken,String);
    check(options.hash,String);

    var tokenData = UploadTokens.findOne({_id:uploadToken});

    if(!tokenData || tokenData.type !== 'version') throw new Meteor.Error("Unknown upload token");

    var version = Versions.findOne({_id:tokenData.typeId});
    if(!version) throw new Meteor.Error("Unknown version data");

    //XXX: verify hash
    Versions.update(version._id,{$set:{
      readme:{
        hash: options.hash,
        url: Meteor.settings.public.url + '/upload/version/' + tokenData.typeId + '_readme.md'
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
    Stratosphere.utils.checkAccess();
    record.dependencies = _.toArrayFromObj(record.dependencies,'packageName')
    Stratosphere.schemas.CreatePackageVersionSchema.clean(record,{autoConvert:false,removeEmptyStrings:false});
    check(record,Stratosphere.schemas.CreatePackageVersionSchema);

    var pack = Packages.findOne({name:record.packageName});
    var version = Versions.findOne({packageName:record.packageName,version:record.version});

    if(!pack)
      throw new Meteor.Error("404","Package does not exist");


    if(pack.private){
      if(version){
        throw new Meteor.Error("Version already exists");
      }
    }else{
      console.log("Making package "+pack.name+" private");
      pack._id = makePrivatePackage({name:pack.name});
    }

    var d = new Date();

    _.extend(record,{
      versionMagnitude:Stratosphere.utils.versionMagnitude(record.version),
      lastUpdated: new Date(),
      private:true,
      hidden:true
    });

    record._id = Versions.insert(record);

    var token = {
      type:'version',
      typeId:record._id,
      packageId:pack._id,
      paths:{sources:'',readme:''},
      createdAt: d
    };

    token._id = UploadTokens.insert(token);

    console.log("Created package version "+record._id);
    return {
      uploadToken: token._id,
      uploadUrl: Meteor.settings.public.url + '/upload/?token='+token._id+'&type=sources',
      readmeUrl: Meteor.settings.public.url + '/upload/?token='+token._id+'&type=readme'
    }
  },

  /**
   * Publish version of a package
   */
  publishPackageVersion: function(uploadToken, hashes){
    Stratosphere.utils.checkAccess();
    check(uploadToken,String);
    check(hashes,Stratosphere.schemas.PackageVersionHashes);

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

    var uploadUrlBase = Meteor.settings.public.url;

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
          url: uploadUrlBase + '/upload/version/' + tokenData.typeId + '.tgz',
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