Meteor.publish('stratosphere/version', function(versionId) {
  try{
    Stratosphere.utils.checkAccess();
    check(versionId, String);
    return Versions.find(versionId);
  }catch(e){
    return [];
  }
});
