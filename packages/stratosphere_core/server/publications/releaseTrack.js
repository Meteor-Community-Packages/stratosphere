Meteor.publish('/stratosphere/releaseTrack', function(track) {
  try{
    Stratosphere.utils.checkAccess('canSynchronize',this.userId);
    check(track,String);

    Counts.publish(this, 'nbReleaseVersions', ReleaseVersions.find({track:track}), {noReady:true});
    return [
      ReleaseTracks.find({name:track}),
      ReleaseVersions.find({track:track},{sort:{versionMagnitude:-1},limit:5,fields:{track:1,versionMagnitude:1,version:1,lastUpdated:1,publishedBy:1,recommended:1}})
    ];
  }catch(e){
    return [];
  }

});