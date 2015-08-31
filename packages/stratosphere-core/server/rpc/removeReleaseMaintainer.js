Meteor.methods({
    /**
     * Remove a maintainer from a version
     */
    removeReleaseMaintainer:function(track,username){
        Stratosphere.utils.checkAccess();
        Stratosphere.utils.removeMaintainerFromX(track,username,'track');
    }
});