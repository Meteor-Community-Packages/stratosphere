Meteor.methods({
    /**
     * Remove a maintainer from a package
     */
    removeMaintainer:function(pack,username){
        Stratosphere.utils.checkAccess();
        Stratosphere.utils.removeMaintainerFromX(pack,params.username,'package');
    },
});