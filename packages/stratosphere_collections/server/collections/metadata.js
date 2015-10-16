/**
 * Collection
 */
Metadata = new Mongo.Collection("metadata");

/**
 * Indexes
 */
Metadata._ensureIndex({ "key": 1 });