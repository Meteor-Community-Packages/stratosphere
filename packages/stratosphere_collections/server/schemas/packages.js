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
