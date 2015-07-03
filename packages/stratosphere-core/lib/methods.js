
/**
 * Methods - custom methods for browser client
 */
Meteor.methods({
  refresh:function(){
    Stratosphere.utils.checkAccess();
    var synchronizer = new Synchronizer();
    synchronizer.synchronize();
  },

  /**
   * Unpublish a package
   * @param id
   * @returns {boolean}
   */
  unPublishPackage:function(id){
    Stratosphere.utils.checkAccess();
    check(id,String);

    var pack = Packages.findOne({_id:id,private:true});
    if(!pack) throw new Meteor.Error('No such private package, stratosphere can only unpublish private packages');

    Packages.remove(pack._id);
    Versions.remove({packageName:pack.name});
    Builds.remove({buildPackageName:pack.name});
    var date = new Date();

    if(pack.upstream){
      Packages.update({_id:pack.upstream},{$set:{name:pack.name}});
      Versions.update({packageName:pack.name+"-UPSTREAM"},{$set:{packageName:pack.name}},{multi:true});
    }
    Metadata.update({key:'lastDeletion'},{$set:{value:date.getTime()}});

    var wrench = Npm.require('wrench');
    var fs = Npm.require('fs');
    var path = Npm.require('path');
    var targets = ['version','build'];

    for(var i = 0; i < targets.length; i++){
      var destination = path.join(Meteor.settings.directories.uploads,targets[i],pack._id);
      if(fs.existsSync(destination))
        wrench.rmdirSyncRecursive(destination);
    }

    console.log("Unpublished package " + pack.name);
    return true;
  }
});