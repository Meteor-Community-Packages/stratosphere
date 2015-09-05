
Meteor.publish('versions', function(packageId) {
    Stratosphere.utils.checkAccess();
    check(packageId, String);
    var pack = Packages.findOne(packageId);
    if(pack){
        return Versions.find({packageName:pack.name/*,hidden:false*/});
    }
});
