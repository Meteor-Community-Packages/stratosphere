Meteor.publish('packageDetails', function(packageId) {
    Stratosphere.utils.checkAccess();
    check(packageId,String);
    return Packages.find({_id:packageId});
});