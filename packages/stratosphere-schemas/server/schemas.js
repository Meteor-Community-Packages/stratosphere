/**
 * Some base schemas
 * @type {SimpleSchema}
 */

Stratosphere.schemas = {};

Stratosphere.schemas.UserSchema = new SimpleSchema({
  'username':{
    type: String
  },
  'id':{
    type: String
  },
  'isOrganization':{
    type: Boolean,
    optional:true
  }
});
Stratosphere.schemas.BaseSchema = new SimpleSchema({
  'lastUpdated':{
    type:Date
  }
});
Stratosphere.schemas.CustomFieldsSchema = new SimpleSchema({
  hidden:{
    type:Boolean,
    defaultValue:true
  },
  private:{
    type:Boolean,
    defaultValue:false
  },
  upstream:{
    type:String,
    optional:true
  },
  versionMagnitude:{
    type:Number
  },
  latestVersion:{
    type:String,
    optional:true
  },
  buildPackageName:{
    type:String
  }
});

/**
 * Package related schemas
 */
Stratosphere.schemas.PackageSchema = new SimpleSchema([Stratosphere.schemas.BaseSchema,{
  'name': {
    type: String,
    custom:Stratosphere.utils.validatePackageName
  },
  'homepage':{
    type:String,
    optional:true
  },
  'maintainers':{
    type: Stratosphere.schemas.UserSchema
  }
}]);
Stratosphere.schemas.CustomPackageSchema = new SimpleSchema([Stratosphere.schemas.PackageSchema,Stratosphere.schemas.CustomFieldsSchema.pick(['latestVersion','upstream','private','hidden'])]);

Stratosphere.schemas.CreatePackageSchema =  Stratosphere.schemas.PackageSchema.pick(['name']);
Stratosphere.schemas.ChangePackageHomepageSchema = Stratosphere.schemas.PackageSchema.pick(['name','homepage']);
Stratosphere.schemas.ModifyMaintainerSchema = new SimpleSchema([Stratosphere.schemas.PackageSchema.pick(['name']),{'username':{type:String}}]);
/**
 * Version related schemas
 */
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
Stratosphere.schemas.ReadmeSchema = new SimpleSchema({
  'url':{
    type:String
  },
  'hash':{
    type:String
  }
});

Stratosphere.schemas.PackageVersionHashes = new SimpleSchema([Stratosphere.schemas.VersionSourceSchema.pick(['tarballHash','treeHash']),{readmeHash:{type:String,optional:true}}]);

Stratosphere.schemas.VersionSchema = new SimpleSchema([Stratosphere.schemas.BaseSchema,{
  'packageName':{
    type:String,
    custom:Stratosphere.utils.validatePackageName
  },
  'version':{
    type:String,
    custom:Stratosphere.utils.validateVersion
  },
  'description':{
    type:String,
    max:100
  },
  'longDescription':{
    type:String,
    optional:true,
    max:1500
  },
  'earliestCompatibleVersion':{
    type:String,
    defaultValue:'1.0.0'
  },
  'ecRecordFormat':{
    type:String,
    defaultValue:'1.0'
  },
  'git':{
    type:String,
    optional:true
  },
  'compilerVersion':{
    type:String
  },
  'containsPlugins':{
    type:Boolean
  },
  'debugOnly':{
    type:Boolean
  },
  'exports':{
    type:[Object],
    optional:true
  },
  'exports.$.name':{
    type:String
  },
  'exports.$.architectures':{
    type:[String]
  },
  'releaseName':{
    type:String
  },
  'dependencies':{
    type:[Object]
  },
  'dependencies.$.packageName':{
    type:String,
    optional:true
  },
  'dependencies.$.constraint':{
    type:String,
    optional:true
  },
  'dependencies.$.references':{
    type:[Object]
  },
  'dependencies.$.references.$.arch':{
    type:String
  },
  'dependencies.$.references.$.implied':{
    type:Boolean,
    optional:true
  },
  'dependencies.$.references.$.weak':{
    type:Boolean,
    optional:true
  },
  'dependencies.$.references.$.unordered':{
    type:Boolean,
    optional:true
  },
  'unmigrated':{
    type:Boolean,
    optional:true
  },
  'source':{
    type:Stratosphere.schemas.VersionSourceSchema,
    optional:true
  },
  'readme':{
    type:Stratosphere.schemas.ReadmeSchema,
    optional:true
  },
  'publishedBy':{
    type:Stratosphere.schemas.UserSchema,
    optional:true
  },
  'published':{
    type:Date,
    optional:true
  }
}]);
Stratosphere.schemas.CustomVersionSchema = new SimpleSchema([Stratosphere.schemas.VersionSchema,Stratosphere.schemas.CustomFieldsSchema.pick(['private','hidden','versionMagnitude'])]);
Stratosphere.schemas.ChangeVersionMigrationStatusSchema = Stratosphere.schemas.VersionSchema.pick(['packageName','version','unmigrated']);
Stratosphere.schemas.VersionIdentifierSchema = Stratosphere.schemas.VersionSchema.pick(['packageName','version']);
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
  //'exports',
  //'exports.$.name',
  //'exports.$.architectures',
  'releaseName',
  //'dependencies',
  //'dependencies.$.packageName',
  //'dependencies.$.constraint',
  //'dependencies.$.references',
  //'dependencies.$.references.$.arch',
  //'dependencies.$.references.$.implied',
  //'dependencies.$.references.$.weak',
  //'dependencies.$.references.$.unordered'
]);
Stratosphere.schemas.ChangeVersionMetadataParameters = Stratosphere.schemas.VersionSchema.pick(['git','description','longDescription']);

/**
 * Release Tracks/Versions Schemas
 */
Stratosphere.schemas.ReleaseTrackSchema = Stratosphere.schemas.PackageSchema;
Stratosphere.schemas.CustomReleaseTrackSchema = Stratosphere.schemas.CustomPackageSchema;
Stratosphere.schemas.CreateReleaseTrackParameters = Stratosphere.schemas.CreatePackageParameters;

Stratosphere.schemas.ReleaseVersionSchema = new SimpleSchema([Stratosphere.schemas.BaseSchema,{
  track:{
    type:String
  },
  version:{
    type:String,
    custom:Stratosphere.utils.validateVersion
  },
  orderKey:{
    type:String
  },
  description:{
    type:String
  },
  recommended:{
    type:Boolean,
    defaultValue:false
  },
  tool:{
    type:String
  },
  packages:{
    type:Object,
    blackbox:true
  },
  publishedBy:{
    type:Stratosphere.schemas.UserSchema,
    optional:true
  }
}]);
Stratosphere.schemas.CustomReleaseVersionSchema = new SimpleSchema([Stratosphere.schemas.ReleaseVersionSchema,Stratosphere.schemas.CustomFieldsSchema.pick(['private','hidden'])]);
Stratosphere.schemas.RecommendVersionSchema = new SimpleSchema([Stratosphere.schemas.ReleaseVersionSchema.pick(['track','recommended','version'])]);
Stratosphere.schemas.CreateReleaseVersionSchema = Stratosphere.schemas.ReleaseVersionSchema.pick(['','']);
/**
 * Build related schemas
 */
Stratosphere.schemas.BuildSchema = new SimpleSchema([Stratosphere.schemas.BaseSchema,{
  'versionId':{
    type:String
  },
  'builtBy':{
    type:Stratosphere.schemas.UserSchema,
    optional:true
  },
  'buildPublished':{
    type:Date
  },
  'buildArchitectures':{
    type:String
  }
}]);
Stratosphere.schemas.CustomBuildSchema = new SimpleSchema([Stratosphere.schemas.BuildSchema,Stratosphere.schemas.CustomFieldsSchema.pick(['private','hidden','buildPackageName'])]);
Stratosphere.schemas.CreatePackageBuildParameters = new SimpleSchema([Stratosphere.schemas.VersionSchema.pick(['packageName','version']),Stratosphere.schemas.BuildSchema.pick('buildArchitectures')]);

/**
 * Other related schemas
 */
Stratosphere.schemas.SyncTokenSchema = new SimpleSchema({
  'lastDeletion': {
    type: Number
  },
  'format': {
    type: String
  },
  'packages': {
    type: Number
  },
  'versions': {
    type: Number
  },
  'builds': {
    type: Number
  },
  'releaseTracks': {
    type: Number
  },
  'releaseVersions': {
    type: Number
  },
  'stratosphere': {
    type: Boolean,
    optional:true,
    defaultValue:false
  },
  '_id': {
    type: String,
    optional:true
  }
});
Stratosphere.schemas.SyncOptionsSchema = new SimpleSchema({
  'compressCollections':{
    type: Boolean,
    optional:true,
    defaultValue:false
  },
  'useShortPages':{
    type: Boolean,
    optional:true,
    defaultValue:false
  }
});