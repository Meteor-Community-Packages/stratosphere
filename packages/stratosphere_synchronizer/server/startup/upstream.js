Stratosphere.UpstreamConn = '';

/**
 * Connect to upstream package server
 */
function connectToPackageServer(){
  if(!Meteor.settings.upstreamURL) return;
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
  console.log('-Connect with upstream server');
  connectToPackageServer();
});