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
  }
});

Template.packageItem.events({

});