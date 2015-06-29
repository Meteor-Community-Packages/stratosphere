Template.packageItem.helpers({
  ownPackage: function() {
    return this.userId == Meteor.userId();
  },
  description: function() {
    var a = document.createElement('a');
    a.href = this.url;
    return a.hostname;
  },
  maintainers: function(){
    return _.pluck(this.maintainers,'username').join();
  },
  showOnDetails:function(){
    return (Router.current().route.getName() === 'packageDetails') ? '' : 'hidden';
  },
  hideOnDetails:function(){
    return (Router.current().route.getName() === 'packageDetails') ? 'hidden' : '';
  }
});

Template.packageItem.events({
  'click .unpublish' : function(e){
    e.preventDefault();
    var id = $(e.target).data('id');
    Meteor.call('unPublishPackage', id, function(error, result) {
      if(error)throwError('Error while deleting package :'+name);
      Router.go('home');
    });
  }
});