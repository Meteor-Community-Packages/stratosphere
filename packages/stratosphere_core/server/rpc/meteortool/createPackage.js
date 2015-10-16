Stratosphere.schemas.CreatePackageSchema = Stratosphere.schemas.PackageSchema.pick(['name']);

Meteor.methods({
    /**
     * Create a package
     * Current behavior when a package already exists upstream is to rename the upstream package
     * by adding the "-UPSTREAM"-suffix
     */
    createPackage: function (data) {
        Stratosphere.utils.checkAccess('canPublish');
        return  Stratosphere.utils.makePrivatePackage(data);
    }
});