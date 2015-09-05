Stratosphere.schemas.CreateReleaseVersionSchema = Stratosphere.schemas.ReleaseVersionSchema.pick(['','']);

Meteor.methods({
    /**
     * Create a release version
     * {
     *   track,
     *   version,
     *   orderKey,
     *   description,
     *   recommended,
     *   tool,
     *   packages
     * };
     */
    createReleaseVersion:function(record){
        Stratosphere.utils.checkAccess();
        Stratosphere.schemas.CreateReleaseVersionSchema.clean(record);
        check(Stratosphere.schemas.CreateReleaseVersionSchema,record);
        //XXX
    }
});