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
