/**
 * Collection
 */
Builds = new Mongo.Collection("builds");

/**
 * Indexes
 */
if(Meteor.isServer){
    Builds._ensureIndex({ "versionId": 1 });
    Builds._ensureIndex({ "versionId": 1, "buildArchitectures": 1 });
    Builds._ensureIndex({ "private": 1 });
    Builds._ensureIndex({ "hidden":1, "lastUpdated":1});
}

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
