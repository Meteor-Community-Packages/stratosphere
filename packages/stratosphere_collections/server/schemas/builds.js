/**
 * Schemas
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
