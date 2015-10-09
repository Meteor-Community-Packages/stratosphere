Meteor.publish('stratosphere/package', function(packageName) {
    try{
        Stratosphere.utils.checkAccess();
        check(packageName,String);

        return [
            Packages.find({name:packageName}),
            Versions.find({packageName:packageName},{sort:{versionMagnitude:-1},limit:5,fields:{packageName:1,lastUpdated:1,versionMagnitude:1,version:1}})
        ];
    }catch(e){
        return [];
    }

});