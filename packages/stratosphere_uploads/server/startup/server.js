const path = Npm.require('path');
const fs = Npm.require('fs');
const wrench = Npm.require('wrench');
const fsExtra = Npm.require('fs-extra');


Meteor.startup(function () {
  console.log('-Start upload server');

  Meteor.settings.public.url = Meteor.settings.public.url.replace(/\/+$/, "");

  const meteor_root = fs.realpathSync( process.cwd() + '/../' );
  let application_root = fs.realpathSync( meteor_root + '/../' );

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
      const tokenData = UploadTokens.findOne({_id:query.token,used:false});

      if(!tokenData){
        fs.unlinkSync(fileInfo.path);
        throw new Error("Invalid upload token");
      }

      let destination = path.join(Meteor.settings.directories.uploads,tokenData.packageId);
      let filename;
      switch(tokenData.type){
        case 'build':
          destination = path.join(destination,'versions',tokenData.versionId,'builds',tokenData.buildId);
          filename = 'build.tgz';
          break;
        case 'version':
          destination = path.join(destination,'versions',tokenData.versionId);
          filename = 'sources.tgz';
          break;
        case 'readme':
          destination = path.join(destination,'versions',tokenData.versionId);
          filename = 'README.md';
          break;
      }

      if(!fs.existsSync(destination)){
        wrench.mkdirSyncRecursive(destination);
      }

      destination = path.join(destination,filename);

      fsExtra.copySync(fileInfo.path, destination);
      fs.unlinkSync(fileInfo.path);

      UploadTokens.update(tokenData._id,{$set:{used:true}});
    }
  });
});