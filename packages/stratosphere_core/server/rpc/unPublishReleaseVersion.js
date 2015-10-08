Meteor.methods({
  /**
   * Unpublish a release version
   * @param id
   * @returns {boolean}
   */
  unPublishReleaseVersion:function(id){
    //Little bit of security
    Stratosphere.utils.checkAccess();
    check(id,String);

    //We can only delete private versions
    const releaseVersion = ReleaseVersions.findOne({_id:id,private:true},{fields:{track:1,version:1}});
    if(!releaseVersion) throw new Meteor.Error('No such private release version, Stratosphere can only unpublish private releaseVersions');

    //Remove from DB
    ReleaseVersions.remove(releaseVersion._id);

    let msg = `Unpublished release version ${releaseVersion.version} of track ${releaseVersion.track}`;
    console.log(msg);
    return msg;
  }
});