Meteor.methods({
    /**
     * Create a patch release version
     */
    createPatchReleaseVersion:function(record,patchFrom){
        Stratosphere.utils.checkAccess('canPublish');
        check(patchFrom,String);
        //XXX: what exactly is this supposed to do?
        Meteor.call('createReleaseVersion',record);

        ReleaseVersions.update({track:record.track,version:patchFrom},{$set:{patchReleaseVersion:record.version}});
    }
});