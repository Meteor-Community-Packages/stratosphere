Meteor.publish('stratosphere/versions', function(packageName) {
    try{
        Stratosphere.utils.checkAccess();
        check(packageName, String);
        return Versions.find({packageName:packageName},{fields:{packageName:1,lastUpdated:1,versionMagnitude:1,version:1}});
    }catch(e){
        return [];
    }
});
