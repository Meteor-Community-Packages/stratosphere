Meteor.methods({
  /**
   * Unpublish a release version
   * @param id
   * @returns {boolean}
   */
  '/stratosphere/unPublishReleaseVersion':function(id){
    //Little bit of security
    Stratosphere.utils.checkAccess('canUnpublish');
    check(id,String);

    //We can only delete private versions
    const releaseVersion = ReleaseVersions.findOne({_id:id,private:true},{fields:{track:1,version:1}});
    if(!releaseVersion) throw new Meteor.Error('No such private release version, Stratosphere can only unpublish private releaseVersions');

    //Remove from DB
    ReleaseVersions.remove(releaseVersion._id);

    const date = new Date();

    //Reset track cache
    const track = ReleaseTracks.findOne({name:releaseVersion.track},{fields:{latestVersion:1}});
    if(track.latestVersion.id === releaseVersion._id){
      const latestVersion = ReleaseVersion.findOne({track:releaseVersion.track},{sort:{versionMagnitude:1},fields:{description:1,version:1}});

      if(latestVersion){
        ReleaseTracks.update(track._id,{$set:{latestVersion:{
          id: latestVersion._id,
          description: latestVersion.description,
          version: latestVersion.version,
          published: date
        }}});
      }else{
        ReleaseTracks.update(track._id,{$unset:{latestVersion:1}});
      }
    }

    //trigger resets downstream
    Metadata.update({key:'lastDeletion'},{$set:{value:date.getTime()}});

    let msg = `Unpublished release version ${releaseVersion.version} of track ${releaseVersion.track}`;
    console.log(msg);
    return msg;
  }
});