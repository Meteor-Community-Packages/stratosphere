/**
 * Collection
 */
Packages = new Mongo.Collection("packages");

/**
 * Indexes
 */
if(Meteor.isServer){
    Packages._ensureIndex({ "name": 1});
    Packages._ensureIndex({ "private": 1 });
    Packages._ensureIndex({ "private": 1, "hidden": 1 });
    Packages._ensureIndex({ "name": 1, "private": 1 });
    Packages._ensureIndex({ name: "text" });
    //Packages._ensureIndex({ name: "text", "private": 1 });
    Packages._ensureIndex({ "hidden":1, "lastUpdated":1});
}

/**
 * Schemas
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
