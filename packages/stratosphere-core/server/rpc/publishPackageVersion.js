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
        Stratosphere.utils.checkAccess();
        check(uploadToken, String);
        check(hashes, Stratosphere.schemas.PackageVersionHashes);

        var tokenData = UploadTokens.findOne({_id: uploadToken});
        if (!tokenData || tokenData.type !== 'version') {
            throw new Meteor.Error("Invalid upload token");
        }

        UploadTokens.remove({_id: uploadToken});
        var version = Versions.findOne({_id: tokenData.typeId});
        if (!version) {
            throw new Meteor.Error("Invalid upload token");
        }

        //XXX verify hashes?
        var publishedBy = {};

        var uploadUrlBase = Meteor.settings.public.url;

        var pack = Packages.findOne({name: version.packageName});

        if (Meteor.user()) {
            publishedBy = {username: Meteor.user().username, id: Meteor.userId()};

            var maintainer = {username: Meteor.user().username, id: Meteor.userId()};
            if (!pack.hasOwnProperty("maintainers")) {
                Packages.update({name: version.packageName}, {$set: {maintainers: []}});
            }

            if (!_.pluck(pack.maintainers, 'username').indexOf(Meteor.user().username)) {
                Packages.update({name: version.packageName}, {$push: {maintainers: maintainer}});
            }

        }

        var date = new Date();
        //Cache latest version
        Packages.update({name: version.packageName}, {
            $set: {
                latestVersion: {
                    id: version._id,
                    description: version.description,
                    version: version.version,
                    published: date
                }
            }
        });
        //Publish version
        Versions.update(version._id, {
            $set: {
                lastUpdated: date,
                published: date,
                publishedBy: publishedBy,
                hidden: false,
                source: {
                    url: uploadUrlBase + '/upload/version/' + tokenData.typeId + '.tgz',
                    tarballHash: hashes.tarballHash,
                    treeHash: hashes.treeHash
                },
                readme: {
                    url: uploadUrlBase + '/upload/version/' + tokenData.typeId + '_readme.md',
                    hash: hashes.readmeHash
                }
            }
        });

        //If this is the first version published, publish the package
        if (pack.hidden) {
            Stratosphere.utils.publishPackage(pack.name);
        }

        console.log("Published package version " + version._id);
        return true;
    }
});