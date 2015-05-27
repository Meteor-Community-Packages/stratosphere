FindFromPublication.publish('packageList', function(options) {
  if(Meteor.settings.loginRequired && !Meteor.user()) return;

  check(options, {
    sort: Object,
    limit: Number
  });
  return Packages.find({custom:true},options);
});

Meteor.publish('meteor.loginServiceConfiguration', function() {
  var sub = this;
  sub.added('meteor_accounts_loginServiceConfiguration', 1, { clientId: '1', service: 'meteor-developer' });
});

Meteor.publish('nbPackages', function() {
  if(Meteor.settings.loginRequired && !Meteor.user()) return;
  Counts.publish(this, 'nbPackages', Packages.find({custom:true}));
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
    return Versions.find({packageName:pack.name},{sort:{versionInt:-1}});
  }
});

SearchSource.defineSource('packages', function(searchText, options) {
  var options = {sort: {name: 1}, limit: 20};

  if(searchText) {
    return Packages.find({$text: {$search: searchText}, custom:true}).fetch();
  } else {
    return Packages.find({}, options).fetch();
  }
});
