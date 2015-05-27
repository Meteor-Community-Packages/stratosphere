Template.packageDetails.helpers({
  versions: function() {
    return Versions.find({versionId: this._id},{sort:{versionInt:-1}});
  }
});