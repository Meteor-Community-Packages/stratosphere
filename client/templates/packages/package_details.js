Template.packageDetails.helpers({
  versions: function() {
    return Versions.find({packageName: this.name},{sort:{versionInt:-1}});
  }
});