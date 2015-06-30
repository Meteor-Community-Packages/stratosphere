var path = Npm.require('path');
var fs = Npm.require('fs');
var wrench = Npm.require('wrench');
var fsExtra = Npm.require('fs-extra');


Meteor.startup(function () {
  console.log('-Start upload server');

  Meteor.settings.public.url = Meteor.settings.public.url.replace(/\/+$/, "");

  var meteor_root = fs.realpathSync( process.cwd() + '/../' );
  var application_root = fs.realpathSync( meteor_root + '/../' );

// if running on dev mode
  if( path.basename( fs.realpathSync( meteor_root + '/../../../' ) ) == '.meteor' ){
    application_root =  fs.realpathSync( meteor_root + '/../../../../' );
  }

  Meteor.settings.application_root = application_root;

  function isRelative(dir){
    return path.resolve(dir) !== path.normalize(dir);
  }

  if(isRelative(Meteor.settings.directories.tmp)){
    Meteor.settings.directories.tmp =  path.join(application_root,Meteor.settings.directories.tmp);
  }

  if(isRelative(Meteor.settings.directories.uploads)){
    Meteor.settings.directories.uploads =  path.join(application_root,Meteor.settings.directories.uploads);
  }

  UploadServer.init({
    tmpDir: Meteor.settings.directories.tmp,
    uploadDir: Meteor.settings.directories.uploads,
    uploadUrl: '/upload/',
    checkCreateDirectories: true,
    validateRequest: function(req, res){
     // console.log(req,res);
      return;
    },
    finished: function(fileInfo, query) {
      var tokenData = UploadTokens.findOne({_id:query.token});

      if(!tokenData || !tokenData.paths.hasOwnProperty(query.type)){
        fs.unlinkSync(fileInfo.path);
        throw new Error("Unmatched upload type");
      }

      var destination = path.join(Meteor.settings.directories.uploads,tokenData.type);

      if(!fs.existsSync(destination))
        wrench.mkdirSyncRecursive(destination);

      var filename = tokenData.typeId;

      if(query.type === 'readme'){
        filename += '_readme.md';
      }else{
        filename += '.tgz';
      }

      destination = path.join(destination,filename);

      fsExtra.copySync(fileInfo.path, destination);
      fs.unlinkSync(fileInfo.path);

      tokenData.paths[query.type] = destination;

      UploadTokens.upsert(tokenData._id,tokenData);
    }
  });
});