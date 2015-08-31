Stratosphere.schemas.SyncOptionsSchema = new SimpleSchema({
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

Meteor.methods({
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
    }
});