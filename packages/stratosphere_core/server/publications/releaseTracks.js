Meteor.publish('stratosphere/releaseTracks', function(limit) {
  try{
    Stratosphere.utils.checkAccess();
    check(limit,String);
    return ReleaseTracks.find(packageId,{limit:limit});
  }catch(e){
    return [];
  }

});