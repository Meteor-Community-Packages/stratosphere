Meteor.methods({
    /**
     * Create a release track
     */
    createReleaseTrack:function(data){
        Stratosphere.utils.checkAccess();
        makePrivateTrack(data);
    }
});