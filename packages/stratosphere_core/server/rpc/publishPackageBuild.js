Meteor.methods({
    /**
     * Publish a build of package
     *
     * @param uploadToken(String)
     * @param tarballHash(String)
     * @param treeHash
     */
    publishPackageBuild: function(uploadToken,tarballHash,treeHash){
        Stratosphere.utils.checkAccess();

        check(uploadToken,String);
        check(tarballHash,String);
        check(treeHash,String);

        const tokenData = UploadTokens.findOne({_id:uploadToken});
        if(!tokenData || tokenData.type !== "build"){
            throw new Meteor.Error("Invalid upload token");
        }


        UploadTokens.remove({_id:uploadToken});
        const build = Builds.findOne({_id:tokenData.typeId});
        if(!build){
            throw new Meteor.Error("Invalid upload token");
        }

        let builtBy = {};
        if(Meteor.user()){
            builtBy = {username:Meteor.user().username,id:Meteor.userId()};
        }
        const date = new Date();

        const update = {
            build:{
                treeHash: treeHash,
                tarballHash: tarballHash,
                url: `${Meteor.settings.public.url}/upload/build/${tokenData.packageId}/${tokenData.typeId}.tgz`
            },
            builtBy:builtBy,
            hidden:false,
            lastUpdated:date,
            buildPublished:date
        };
        Builds.update(tokenData.typeId,{$set:update});

        console.log(`Published package build ${build._id}`);
        return true;
    }
});