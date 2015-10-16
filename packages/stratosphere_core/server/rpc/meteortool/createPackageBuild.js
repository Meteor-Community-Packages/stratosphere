Stratosphere.schemas.CreatePackageBuildParameters = new SimpleSchema([Stratosphere.schemas.VersionSchema.pick(['packageName','version']),Stratosphere.schemas.BuildSchema.pick('buildArchitectures')]);

Meteor.methods({
    /**
     * Create a certain build of a package?
     *
     * @returns
     * {
     *   uploadToken(String)
     *   uploadUrl(String)
     * }
     */
    createPackageBuild: function(data){
        Stratosphere.utils.checkAccess('canPublish');

        Stratosphere.schemas.CreatePackageBuildParameters.clean(data);
        check(data,Stratosphere.schemas.CreatePackageBuildParameters);

        const pack = Packages.findOne({name:data.packageName, private:true});
        const version = Versions.findOne({packageName:data.packageName,version:data.version, private:true});
        if(!pack || !version) throw new Meteor.Error("Unknown private package or version");

        const build = Builds.findOne({versionId:version._id,buildArchitectures:data.buildArchitectures});
        if(build) throw new Meteor.Error("Build already exists");

        const date = new Date();

        const insert = {
            buildArchitectures: data.buildArchitectures,
            versionId: version._id,
            lastUpdated: date,
            hidden:true,
            private: true,
            buildPackageName:data.packageName
        };
        insert._id = Builds.insert(insert);

        const token = {
            type:'build',
            buildId:insert._id,
            packageId:pack._id,
            versionId:version._id,
            createdAt: date,
            used:false
        };
        token._id = UploadTokens.insert(token);

        console.log(`Create package build ${insert._id}`);

        return {
            uploadToken: token._id,
            uploadUrl: `${Meteor.settings.public.url}/upload/?token=${token._id}&type=build`,
        }
    }
});