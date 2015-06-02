FindFromPublication.publish('packageList', function(options) {
  if(Meteor.settings.loginRequired && !Meteor.user()) return;

  check(options, {
    sort: Object,
    limit: Number
  });
  return Packages.find({private:true},options);
});


Meteor.publish('nbPackages', function() {
  if(Meteor.settings.loginRequired && !Meteor.user()) return;
  Counts.publish(this, 'nbPackages', Packages.find({private:true}));
});

Meteor.publish('packageDetails', function(packageId) {
  if(Meteor.settings.loginRequired && !Meteor.user()) return;
  check(packageId,String);
  return Packages.find({_id:packageId});
});

Meteor.publish('versions', function(packageId) {
  if(Meteor.settings.loginRequired && !Meteor.user()) return;
  check(packageId, String);
  var pack = Packages.findOne(packageId);
  if(pack){
    return Versions.find({packageName:pack.name});
  }
});

SearchSource.defineSource('packages', function(searchText, options) {
  var options = {sort: {name: 1}, limit: 20};

  if(searchText) {
    return Packages.find({$text: {$search: searchText}, private:true}).fetch();
  } else {
    return Packages.find({}, options).fetch();
  }
});
