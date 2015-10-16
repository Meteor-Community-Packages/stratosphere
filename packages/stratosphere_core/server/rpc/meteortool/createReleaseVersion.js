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
        Stratosphere.utils.checkAccess('canPublish');
        Stratosphere.schemas.CreateReleaseVersionSchema.clean(record);
        check(record,Stratosphere.schemas.CreateReleaseVersionSchema);

        const track = ReleaseTracks.findOne({name: record.track,private:true});
        if (!track) {
            throw new Meteor.Error("No such private track");
        }

        let publishedBy = {};
        if(Meteor.user()){
            publishedBy = {username:Meteor.user().username,id:Meteor.userId()};
        }

        const date = new Date();

        //add to db
        _.extend(record,{
            lastUpdated: new Date(),
            versionMagnitude:Stratosphere.utils.versionMagnitude(record.version),
            private:true,
            published:date,
            publishedBy:publishedBy
        });
        ReleaseVersions.insert(record);


        //Cache latest version
        if(!track.latestVersion || Stratosphere.utils.versionMagnitude(track.latestVersion.version) < record.versionMagnitude){
            //Cache latest version
            ReleaseTracks.update(track._id, {
                $set: {
                    latestVersion: {
                        id: record._id,
                        description: record.description,
                        version: record.version,
                        published: date
                    }
                }
            });
        }

    }
});