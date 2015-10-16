Meteor.methods({
    /**
     * Publish a build of package
     *
     * @param uploadToken(String)
     * @param tarballHash(String)
     * @param treeHash
     */
    publishPackageBuild: function(uploadToken,tarballHash,treeHash){
        //Little bit of security
        Stratosphere.utils.checkAccess('canPublish');
        check(uploadToken,String);
        check(tarballHash,String);
        check(treeHash,String);

        const tokenData = UploadTokens.findOne({_id:uploadToken,used:true});
        if(!tokenData || tokenData.type !== "build"){
            throw new Meteor.Error("Invalid upload token");
        }


        UploadTokens.remove({_id:tokenData._id});

        const build = Builds.findOne({_id:tokenData.buildId});
        if(!build){
            throw new Meteor.Error("Invalid upload token");
        }

        //Update
        let builtBy = {};
        if(Meteor.user()){
            builtBy = {username:Meteor.user().username,id:Meteor.userId()};
        }
        const date = new Date();

        const update = {
            build:{
                treeHash: treeHash,
                tarballHash: tarballHash,
                url: `${Meteor.settings.public.url}/upload/${tokenData.packageId}/versions/${tokenData.versionId}/builds/${tokenData.buildId}/build.tgz`
            },
            builtBy:builtBy,
            hidden:false,
            lastUpdated:date,
            buildPublished:date
        };
        Builds.update(build._id,{$set:update});

        console.log(`Published package build ${build._id}`);
        return true;
    }
});