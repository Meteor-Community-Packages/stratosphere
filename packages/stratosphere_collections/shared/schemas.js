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

Stratosphere.schemas.publishOptions = new SimpleSchema({
    limit:{
        type:Number,
        defaultValue:10
    },
    skip:{
        type:Number,
        defaultValue:0
    },
    sort:{
        type:Object,
        defaultValue: {name:1}
    },
    "sort.name":{
        type:Number,
        optional:true,
        min:0,
        max:1,
        defaultValue:1
    },
    "sort.lastUpdated":{
        type:Number,
        optional:true,
        min:0,
        max:1,
        defaultValue:1
    }
});