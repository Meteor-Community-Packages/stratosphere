Meteor.methods({
    /**
     * Create a patch release version
     */
    createPatchReleaseVersion:function(record,patchFrom){
        Stratosphere.utils.checkAccess();
        //XXX: what exactly is this supposed to do?
        Meteor.call('createReleaseVersion',record);
    }
});