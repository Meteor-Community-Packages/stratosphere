const wrench = Npm.require('wrench');
const fs = Npm.require('fs');
const path = Npm.require('path');

Meteor.methods({
    /**
     * Unpublish a package
     * @param id
     * @returns {boolean}
     */
    '/stratosphere/unPublishPackage':function(id){

        Stratosphere.utils.checkAccess('canUnpublish');
        check(id,String);

        //We can only delete private packages
        const pack = Packages.findOne({_id:id,private:true});
        if(!pack) throw new Meteor.Error('No such private package, stratosphere can only unpublish private packages');

        //Remove from DB
        Packages.remove(pack._id);
        Versions.remove({packageName:pack.name});
        Builds.remove({buildPackageName:pack.name});
        UploadTokens.remove({packageId:pack._id});


        //Restore upstream package
        if(pack.upstream){
            Packages.update({_id:pack.upstream},{$set:{name:pack.name}});
            Versions.update({packageName:pack.name+"-UPSTREAM"},{$set:{packageName:pack.name}},{multi:true});
        }

        //trigger resets downstream
        const date = new Date();
        Metadata.update({key:'lastDeletion'},{$set:{value:date.getTime()}});

        //Remove related files
        let destination = path.join(Meteor.settings.directories.uploads,pack._id);
        if(fs.existsSync(destination)){
            wrench.rmdirSyncRecursive(destination);
        }

        let msg = `Unpublished package ${pack.name}`;
        console.log(msg);
        return msg;
    }
});