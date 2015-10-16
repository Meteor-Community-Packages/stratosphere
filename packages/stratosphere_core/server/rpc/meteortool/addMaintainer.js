Meteor.methods({
    /**
     * Add a maintainer to a package
     */
    addMaintainer:function(pack,username){
        Stratosphere.utils.checkAccess('canPublish');
        Stratosphere.utils.addMaintainerToX(pack,username,'package');
    }
});