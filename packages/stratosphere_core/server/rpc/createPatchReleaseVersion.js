Meteor.methods({
    /**
     * Create a patch release version
     */
    createPatchReleaseVersion:function(record,patchFrom){
        Stratosphere.utils.checkAccess();
        //XXX
        Meteor.call('createPatchReleaseVersion',record);
    }
});