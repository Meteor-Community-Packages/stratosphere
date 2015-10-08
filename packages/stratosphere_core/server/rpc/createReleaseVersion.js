Stratosphere.schemas.CreateReleaseVersionSchema = Stratosphere.schemas.ReleaseVersionSchema.pick([
  'track',
  'version',
  'orderKey',
  'description',
  'recommended',
  'tool',
  'packages'
]);

Meteor.methods({
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
      //Little bit of security
        Stratosphere.utils.checkAccess();
        Stratosphere.schemas.CreateReleaseVersionSchema.clean(record);
        check(record,Stratosphere.schemas.CreateReleaseVersionSchema);

        let publishedBy = {};
        if(Meteor.user()){
            publishedBy = {username:Meteor.user().username,id:Meteor.userId()};
        }

      //add to db
        _.extend(record,{
            lastUpdated: new Date(),
            versionMagnitude:Stratosphere.utils.versionMagnitude(record.version),
            private:true,
            published:new Date(),
            publishedBy:publishedBy
        });
      ReleaseVersions.insert(record);

    }
});