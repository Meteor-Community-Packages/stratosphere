Stratosphere.schemas.ChangePackageHomepageSchema = Stratosphere.schemas.PackageSchema.pick(['name','homepage']);

Meteor.methods({
    /**
     * Change a package homepage
     */
    _changePackageHomepage:function(name,url){
        Stratosphere.utils.checkAccess('canPublish');
        const params = {name:name,homepage:url};
        Stratosphere.schemas.ChangePackageHomepageSchema.clean(params);
        check(params,Stratosphere.schemas.ChangePackageHomepageSchema);
        console.log('Changing package homepage');
        if(!Packages.update({name:params.name,private:true},{$set:{homepage:params.homepage,lastUpdated:new Date()}}))
            throw new Meteor.Error('404','Package not found');
    }
});