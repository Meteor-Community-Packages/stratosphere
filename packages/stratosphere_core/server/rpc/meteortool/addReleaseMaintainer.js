Meteor.methods({
    /**
     * Add a maintainer to a version
     */
    addReleaseMaintainer:function(track,username){
        Stratosphere.utils.checkAccess('canPublish');
        Stratosphere.utils.addMaintainerToX(track,username,'track');
    }
});