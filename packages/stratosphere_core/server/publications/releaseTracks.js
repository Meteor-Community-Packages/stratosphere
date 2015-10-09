Meteor.publish('stratosphere/releaseTracks', function(limit) {
  try{
    Stratosphere.utils.checkAccess();
    if(!limit) limit = 10;
    check(limit,String);
    return ReleaseTracks.find(packageId,{limit:limit});
  }catch(e){
    return [];
  }

});