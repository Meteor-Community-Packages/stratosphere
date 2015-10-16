Stratosphere.schemas.VersionSourceSchema = new SimpleSchema({
    'tarballHash':{
        type:String
    },
    'treeHash':{
        type:String
    },
    'url':{
        type:String
    }
});
Stratosphere.schemas.PackageVersionHashes = new SimpleSchema([Stratosphere.schemas.VersionSourceSchema.pick(['tarballHash','treeHash']),{readmeHash:{type:String,optional:true}}]);

Meteor.methods({
    /**
     * Publish version of a package
     */
    publishPackageVersion: function(uploadToken, hashes) {
        //Little bit of security
        Stratosphere.utils.checkAccess('canPublish');
        check(uploadToken, String);
        check(hashes, Stratosphere.schemas.PackageVersionHashes);


        const tokenData = UploadTokens.findOne({_id: uploadToken,used:true});
        if (!tokenData || tokenData.type !== 'version') {
            throw new Meteor.Error("Invalid upload token");
        }

        UploadTokens.remove({_id: uploadToken});
        if(uploadToken.relatedTokens){
            UploadTokens.remove({_id: {$in : uploadToken.relatedTokens}});
        }

        const version = Versions.findOne({_id: tokenData.versionId});
        if (!version) {
            throw new Meteor.Error("Invalid upload token");
        }

        //XXX verify hashes?

        //Add publisher metadata
        let publishedBy = {};
        const pack = Packages.findOne({name: version.packageName});

        if (Meteor.user()) {
            publishedBy = {username: Meteor.user().username, id: Meteor.userId()};

            const maintainer = {username: Meteor.user().username, id: Meteor.userId()};
            if (!pack.hasOwnProperty("maintainers")) {
                Packages.update({name: version.packageName}, {$set: {maintainers: []}});
            }

            if (!_.pluck(pack.maintainers, 'username').indexOf(Meteor.user().username)) {
                Packages.update({name: version.packageName}, {$push: {maintainers: maintainer}});
            }

        }

        const date = new Date();

        //Publish to db
        const uploadUrlBase = Meteor.settings.public.url;

        const modifier = {
            lastUpdated: date,
            published: date,
            publishedBy: publishedBy,
            hidden: false,
            source: {
                url: `${uploadUrlBase}/upload/${tokenData.packageId}/versions/${tokenData.versionId}/sources.tgz`,
                tarballHash: hashes.tarballHash,
                treeHash: hashes.treeHash
            },
            readme: {
                url: `${uploadUrlBase}/upload/${tokenData.packageId}/versions/${tokenData.versionId}/README.md`,
                hash: hashes.readmeHash
            }
        };
        //Publish version
        Versions.update(version._id, {
            $set: modifier
        });

        //Cache latest version
        if(!pack.latestVersion || Stratosphere.utils.versionMagnitude(pack.latestVersion.version) < version.versionMagnitude){
            //Cache latest version
            Packages.update(pack._id, {
                $set: {
                    latestVersion: {
                        id: version._id,
                        description: version.description,
                        version: version.version,
                        readme: modifier.readme.url,
                        published: date
                    }
                }
            });
        }


        //If this is the first version published, publish the package
        if (pack.hidden) {
            Stratosphere.utils.publishPackage(pack.name);
        }

        console.log(`Published package version ${version._id}`);
        return true;
    }
});