Meteor.methods({
    /**
     * Unpublish a package
     * @param id
     * @returns {boolean}
     */
    unPublishPackage:function(id){
        Stratosphere.utils.checkAccess();
        check(id,String);

        const pack = Packages.findOne({_id:id,private:true});
        if(!pack) throw new Meteor.Error('No such private package, stratosphere can only unpublish private packages');

        Packages.remove(pack._id);
        Versions.remove({packageName:pack.name});
        Builds.remove({buildPackageName:pack.name});
        const date = new Date();

        if(pack.upstream){
            Packages.update({_id:pack.upstream},{$set:{name:pack.name}});
            Versions.update({packageName:pack.name+"-UPSTREAM"},{$set:{packageName:pack.name}},{multi:true});
        }
        Metadata.update({key:'lastDeletion'},{$set:{value:date.getTime()}});

        const wrench = Npm.require('wrench');
        const fs = Npm.require('fs');
        const path = Npm.require('path');
        const targets = ['version','build'];

        for(let target of targets){
            var destination = path.join(Meteor.settings.directories.uploads,target,pack._id);
            if(fs.existsSync(destination)){
                wrench.rmdirSyncRecursive(destination);
            }
        }

        console.log("Unpublished package " + pack.name);
        return true;
    }
});