Stratosphere.schemas.ChangeVersionMigrationStatusSchema = Stratosphere.schemas.VersionSchema.pick(['packageName','version','unmigrated']);
Stratosphere.schemas.ChangeVersionMetadataParameters = Stratosphere.schemas.VersionSchema.pick(['git','description','longDescription']);


Meteor.methods({
    /**
     * Update metadata of a package version
     *
     * @return success(boolean)?
     */
    changeVersionMetadata: function(versionIdentifier, data){
        Stratosphere.utils.checkAccess('canPublish');
        Stratosphere.schemas.VersionIdentifierSchema.clean(versionIdentifier);
        check(versionIdentifier,Stratosphere.schemas.VersionIdentifierSchema);

        Stratosphere.schemas.ChangeVersionMetadataParameters.clean(data);
        check(data,Stratosphere.schemas.ChangeVersionMetadataParameters);

        const pack = Packages.findOne({name:versionIdentifier.packageName,private:true});
        const version = Versions.findOne({packageName:versionIdentifier.packageName,version:versionIdentifier.version, private:true});

        if(!pack || !version)
            throw new Meteor.Error("Unknown private package or version");

        Versions.update(version._id,{$set:data});

        if(pack.latestVersion && pack.latestVersion.id === version._id){
            Packages.update(pack._id,{$set:{"latestVersion.description":version.description}});
        }
        console.log("Changed version metadata for version " + version._id);
        return true;
    }
});