Meteor.methods({
    /**
     * Change version migration status
     */
    _changeVersionMigrationStatus:function(name,version,migrated){
        Stratosphere.utils.checkAccess('canPublish');
        const params = {
            packageName:name,
            version:version,
            unmigrated:!migrated
        };
        Stratosphere.schemas.ChangeVersionMigrationStatusSchema.clean(params);
        check(params,Stratosphere.schemas.ChangeVersionMigrationStatusSchema);
        console.log('Changing version migration state');
        if(!Versions.update({packageName:params.packageName,version:params.version,private:true},{$set:{unmigrated:params.unmigrated}}))
            throw new Meteor.Error('404','Private version not found');

    }
});