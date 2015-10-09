/**
 * Collection
 */
UploadTokens = new Mongo.Collection("uploadTokens");

/**
 * Indexes
 */
if(Meteor.isServer){}

/**
 * Schemas
 */
Stratosphere.schemas.UploadTokenSchema = new SimpleSchema({
    'type': {
        type: String,
        allowedValues: ['build','version','readme']
    },
    'packageId': {
        type: String
    },
    'used':{
        type: Boolean,
        defaultValue:false
    },
    'versionId': {
        type: String,
        optional:true
    },
    'relatedTokens':{
        type:[String],
        optional:true
    },
    'buildId': {
        type: String,
        optional:true
    },
    'createdAt': {
        type: Date
    }
});