Meteor.methods({
  /**
   * Unpublish a release track
   * @param id
   * @returns {boolean}
   */
  '/stratosphere/unPublishReleaseTrack':function(id){
    //Little bit of security
    Stratosphere.utils.checkAccess('canUnpublish');
    check(id,String);

    //We can only delete private versions
    const releaseTrack = ReleaseTracks.findOne({_id:id,private:true},{fields:{track:1}});
    if(!releaseTrack) throw new Meteor.Error('No such private release track, Stratosphere can only unpublish private release tracks');

    //Remove from DB
    ReleaseTracks.remove(releaseTrack._id);
    ReleaseVersions.remove({track:releaseTrack.track});

    let msg = `Unpublished release track ${releaseTrack.track}`;
    console.log(msg);
    return msg;
  }
});