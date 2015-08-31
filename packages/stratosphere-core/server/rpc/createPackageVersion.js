Stratosphere.schemas.CreatePackageVersionSchema = Stratosphere.schemas.VersionSchema.pick([
    'packageName',
    'version',
    'description',
    'longDescription',
    'earliestCompatibleVersion',
    'ecRecordFormat',
    'git',
    'compilerVersion',
    'containsPlugins',
    'debugOnly',
    'exports',
    'exports.$',
    'exports.$.name',
    'exports.$.architectures',
    'exports.$.architectures.$',
    'releaseName',
    'dependencies',
    'dependencies.$',
    'dependencies.$.packageName',
    'dependencies.$.constraint',
    'dependencies.$.references',
    'dependencies.$.references.$',
    'dependencies.$.references.$.arch',
    'dependencies.$.references.$.implied',
    'dependencies.$.references.$.weak',
    'dependencies.$.references.$.unordered'
]);


Meteor.methods({
    /**
     * Create a new package version
     *
     * @return
     * {
     *    uploadToken(String)
     *    readmeUrl(String)
     *    uploadUrl(String)
     * }
     */
    createPackageVersion: function(record){
        Stratosphere.utils.checkAccess();
        record.dependencies = _.toArrayFromObj(record.dependencies,'packageName')
        Stratosphere.schemas.CreatePackageVersionSchema.clean(record,{autoConvert:false,removeEmptyStrings:false});
        check(record,Stratosphere.schemas.CreatePackageVersionSchema);

        const pack = Packages.findOne({name:record.packageName});
        const version = Versions.findOne({packageName:record.packageName,version:record.version});

        if(!pack)
            throw new Meteor.Error("404","Package does not exist");


        if(pack.private){
            if(version){
                throw new Meteor.Error("Version already exists");
            }
        }else{
            console.log("Making package "+pack.name+" private");
            pack._id = makePrivatePackage({name:pack.name});
        }

        const d = new Date();

        _.extend(record,{
            versionMagnitude:Stratosphere.utils.versionMagnitude(record.version),
            lastUpdated: new Date(),
            private:true,
            hidden:true
        });

        record._id = Versions.insert(record);

        const token = {
            type:'version',
            typeId:record._id,
            packageId:pack._id,
            paths:{sources:'',readme:''},
            createdAt: d
        };

        token._id = UploadTokens.insert(token);

        console.log(`Created package version ${record._id}`);
        return {
            uploadToken: token._id,
            uploadUrl: Meteor.settings.public.url + '/upload/?token='+token._id+'&type=sources',
            readmeUrl: Meteor.settings.public.url + '/upload/?token='+token._id+'&type=readme'
        }
    }
});