Meteor.publish('/stratosphere/releaseVersions', function(track) {
  try{
    Stratosphere.utils.checkAccess('canSynchronize',this.userId);
    check(track,String);
    return ReleaseVersions.find({track:track},{fields:{track:1,versionMagnitude:1,version:1,lastUpdated:1,publishedBy:1,recommended:1}});
  }catch(e){
    return [];
  }

});