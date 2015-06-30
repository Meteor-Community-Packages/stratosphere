Template.versionItem.helpers({
  date: function() {
    var date = new Date(this.published);
    return date.toUTCString();
  }
});