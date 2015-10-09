/**
 * Collection
 */
Metadata = new Mongo.Collection("metadata");

/**
 * Indexes
 */
if(Meteor.isServer){
    Metadata._ensureIndex({ "key": 1 });
}

/**
 * Schemas
 */