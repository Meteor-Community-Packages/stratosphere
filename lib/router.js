Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound',
  waitOn: function() {
    return [Meteor.subscribe('nbPackages')]
  }
});

PackageListController = RouteController.extend({
  template: 'packageList',
  increment: 10,
  packageLimit: function() {
    return parseInt(this.params.packageLimit) || this.increment;
  },
  findOptions: function() {
    return {sort: this.sort, limit: this.packageLimit()};
  },
  subscriptions: function() {
    this.packagesSub = Meteor.subscribe('packageList', this.findOptions());
  },
  packages: function() {
    return Packages.findFromPublication('packageList');
  },
  data: function() {
    var self = this;
    return {
      packages: self.packages(),
      ready: self.packagesSub.ready,
      nextPath: function() {
        if (self.packages().count() === self.packageLimit())
          return self.nextPath();
      }
    };
  }
});

RecentPackagesController = PackageListController.extend({
  sort: {newestVersionAt: -1},
  nextPath: function() {
    return Router.routes.recentPackages.path({packagesLimit: this.postsLimit() + this.increment})
  }
});

Router.route('/', {
  name: 'home',
  controller: RecentPackagesController
});

Router.route('/recent/:postsLimit?', {name: 'recentPackages'});

Router.route('/package/:_id', {
  name: 'packageDetails',
  waitOn: function() {
    return [
      Meteor.subscribe('packageDetails', this.params._id),
      Meteor.subscribe('versions', this.params._id)
    ];
  },
  data: function() { return Packages.findOne(this.params._id); }
});



var requireLogin = function() {
  if (! Meteor.user()) {
    if (Meteor.loggingIn()) {
      this.render(this.loadingTemplate);
    } else {
      this.render('accessDenied');
    }
  } else {
    this.next();
  }
}

Router.onBeforeAction('dataNotFound', {only: 'packageDetails'});

if(Meteor.settings.public.loginRequired){
  Router.onBeforeAction(requireLogin);
}