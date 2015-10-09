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
        type:String
    },
    latestVersion:{
        type:String,
        optional:true
    },
    buildPackageName:{
        type:String
    }
});

Stratosphere.schemas.archTypes = ['plugin','os','web.browser','web.cordova'];