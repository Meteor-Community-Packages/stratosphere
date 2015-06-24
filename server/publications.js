function checkAccess(){
  if(Meteor.settings.public.loginRequired && !Meteor.user()){
    throw new Meteor.Error("Insufficient permissions");
  }
}

FindFromPublication.publish('packageList', function(options) {
  checkAccess();

  check(options, {
    sort: Object,
    limit: Number
  });
  return Packages.find({private:true, hidden:false},options);
});

Meteor.publish('nbPackages', function() {
  checkAccess();
  Counts.publish(this, 'nbPackages', Packages.find({hidden:false,private:true}));
});

Meteor.publish('packageDetails', function(packageId) {
  checkAccess();
  check(packageId,String);
  return Packages.find({_id:packageId});
});

Meteor.publish('versions', function(packageId) {
  checkAccess();
  check(packageId, String);
  var pack = Packages.findOne(packageId);
  if(pack){
    return Versions.find({packageName:pack.name,hidden:false});
  }
});

SearchSource.defineSource('packages', function(searchText, options) {
  var options = {sort: {name: 1}, limit: 20};

  if(searchText) {
    return Packages.find({$text: {$search: searchText}, private:true, hidden:false}).fetch();
  } else {
    return Packages.find({}, options).fetch();
  }
});
