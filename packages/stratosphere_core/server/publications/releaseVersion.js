Meteor.publish('stratosphere/releaseVersion', function(versionId) {
  try{
    Stratosphere.utils.checkAccess();
    check(versionId,String);
    return ReleaseVersions.find(versionId);
  }catch(e){
    return [];
  }
});