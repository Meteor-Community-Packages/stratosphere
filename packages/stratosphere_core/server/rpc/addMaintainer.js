Meteor.methods({
    /**
     * Add a maintainer to a package
     */
    addMaintainer:function(pack,username){
        Stratosphere.utils.checkAccess();
        Stratosphere.utils.addMaintainerToX(pack,username,'package');
    }
});