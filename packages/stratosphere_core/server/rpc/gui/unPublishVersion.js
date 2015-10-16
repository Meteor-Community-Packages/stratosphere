const wrench = Npm.require('wrench');
const fs = Npm.require('fs');
const path = Npm.require('path');

Meteor.methods({
  /**
   * Unpublish a package version
   * @param id
   * @returns {boolean}
   */
  '/stratosphere/unPublishVersion' : function(id){
    //Little bit of security
    Stratosphere.utils.checkAccess('canUnpublish');
    check(id,String);

    //We can only delete private versions
    const version = Versions.findOne({_id:id,private:true},{fields:{version:1,packageName:1}});
    if(!version) throw new Meteor.Error('No such private version, Stratosphere can only unpublish private versions');

    //Remove from DB
    Versions.remove(version._id);
    Builds.remove({versionId:version._id});
    UploadTokens.remove({versionId:version._id});

    const date = new Date();

    //Reset package cache
    const pack = Packages.findOne({name:version.packageName},{fields:{latestVersion:1}});
    if(pack.latestVersion.id === version._id){
      const latestVersion = Versions.findOne({packageName:version.packageName},{sort:{versionMagnitude:1},fields:{description:1,version:1,"readme.url":1}});

      if(latestVersion){
        Packages.update(pack._id,{$set:{latestVersion:{
          id: latestVersion._id,
          description: latestVersion.description,
          version: latestVersion.version,
          readme: latestVersion.readme.url,
          published: date
        }}});
      }else{
        Packages.update(pack._id,{$unset:{latestVersion:1}});
      }
    }

    //trigger resets downstream
    Metadata.update({key:'lastDeletion'},{$set:{value:date.getTime()}});

    //Remove related files
    let destination = path.join(Meteor.settings.directories.uploads,pack._id,'versions',version._id);
    if(fs.existsSync(destination)){
      wrench.rmdirSyncRecursive(destination);
    }

    let msg = `Unpublished version ${version.version} of package ${pack.name}`;
    console.log(msg);
    return msg;
  }
});