
Stratosphere.schemas.CreateReleaseTrackSchema = Stratosphere.schemas.ReleaseTrackSchema.pick(['name']);

Meteor.methods({
    /**
     * Create a release track
     */
    createReleaseTrack:function(data){
        Stratosphere.utils.checkAccess('canPublish');
        Stratosphere.utils.makePrivateTrack(data);
    }
});