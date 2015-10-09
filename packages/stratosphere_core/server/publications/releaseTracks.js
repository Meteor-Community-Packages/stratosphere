//FindFromPublication.publish('stratosphere/releaseTracks', function(options) {
Meteor.publish('stratosphere/releaseTracks', function(options) {
  try{
    Stratosphere.utils.checkAccess();
    Stratosphere.schemas.publishOptions.clean(options);
    check(options, Stratosphere.schemas.publishOptions);

    Counts.publish(this, 'nbTracks', ReleaseTracks.find({private:true}), {noReady:true});
    return ReleaseTracks.find(packageId, options);
  }catch(e){
    return [];
  }
});