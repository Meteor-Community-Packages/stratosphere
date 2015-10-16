Meteor.publish('/stratosphere/package', function(packageName) {
    try{
        Stratosphere.utils.checkAccess('canSynchronize',this.userId);
        check(packageName,String);

        Counts.publish(this, 'nbVersions', Versions.find({packageName:packageName}), { noReady: true });
        return [
            Packages.find({name:packageName}),
            Versions.find({packageName:packageName},{sort:{versionMagnitude:-1},limit:5,fields:{packageName:1,lastUpdated:1,versionMagnitude:1,version:1}})
        ];
    }catch(e){
        return [];
    }

});