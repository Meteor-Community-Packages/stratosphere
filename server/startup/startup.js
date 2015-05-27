Stratosphere = {UpstreamConn:''};

function connectToPackageServer(){
  Stratosphere.UpstreamConn = DDP.connect(Meteor.settings.upstreamURL);
  Tracker.autorun(function() {
    var status = Stratosphere.UpstreamConn.status();
    if(status.connected) {
      console.log("Upstream connected: " + Meteor.settings.upstreamURL);
    } else {
      console.log("Upstream disconnected: " + Meteor.settings.upstreamURL);
    }
  });
}


Meteor.startup(function () {
  console.log('Server startup checks');

  console.log('-Make sure an upstream syncToken exists');
  var syncToken = SyncTokens.findOne({});
  if(!syncToken){
    syncToken = {
      format:"1.1"
    }
    SyncTokens.insert(syncToken);
  }

  console.log('-Connect with upstream server');
  connectToPackageServer();

  console.log('-Start upload server');

  UploadServer.init({
    tmpDir: process.env.PWD + '/uploads/tmp',
    uploadDir: process.env.PWD + '/uploads/',
    checkCreateDirectories: true,
    getDirectory: function(fileInfo, formData) {
      if (formData && formData.directoryName != null) {
        return formData.directoryName;
      }
      return "";
    },
    getFileName: function(fileInfo, formData) {
      if (formData && formData.prefix != null) {
        return formData.prefix + '_' + fileInfo.name;
      }
      return fileInfo.name;
    },
    validateRequest: function(req, res){
      console.log(req,res);
    },
    finished: function(fileInfo, formData) {
      if (formData && formData._id != null) {
        Items.update({_id: formData._id}, { $push: { uploads: fileInfo }});
      }
    }
  });
});