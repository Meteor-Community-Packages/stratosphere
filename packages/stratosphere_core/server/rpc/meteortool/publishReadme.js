Stratosphere.schemas.ReadmeSchema = new SimpleSchema({
    'url':{
        type:String
    },
    'hash':{
        type:String
    }
});

Meteor.methods({
    /**
     * Publish a readme file
     *
     * @param uploadToken (String)
     *
     * @param options
     * {
   *  hash(String)
   * }
     *
     */
    publishReadme: function(uploadToken,options) {
        Stratosphere.utils.checkAccess('canPublish');
        check(uploadToken,String);
        check(options.hash,String);

        const tokenData = UploadTokens.findOne({_id:uploadToken,used:true});
        if(!tokenData || tokenData.type !== 'version') throw new Meteor.Error("Unknown upload token");

        UploadTokens.remove(tokenData._id);

        const version = Versions.findOne({_id:tokenData.versionId});
        if(!version) throw new Meteor.Error("Unknown version data");

        //XXX: verify hash
        Versions.update(version._id,{$set:{
            readme:{
                hash: options.hash,
                url: `${Meteor.settings.public.url}/upload/${tokenData.packageId}/versions/${tokenData.versionId}/README.md`
            },
            lastUpdated: new Date()
        }});
        console.log(`Published readme for version ${version._id}`);
    }
});