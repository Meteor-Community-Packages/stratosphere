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
        Stratosphere.utils.checkAccess();
        check(uploadToken,String);
        check(options.hash,String);

        var tokenData = UploadTokens.findOne({_id:uploadToken});

        if(!tokenData || tokenData.type !== 'version') throw new Meteor.Error("Unknown upload token");

        var version = Versions.findOne({_id:tokenData.typeId});
        if(!version) throw new Meteor.Error("Unknown version data");

        //XXX: verify hash
        Versions.update(version._id,{$set:{
            readme:{
                hash: options.hash,
                url: Meteor.settings.public.url + '/upload/version/' + tokenData.packageId + '/' + tokenData.typeId + '_readme.md'
            },
            lastUpdated: new Date()
        }});
        console.log("Published readme for version "+version._id);
    }
});