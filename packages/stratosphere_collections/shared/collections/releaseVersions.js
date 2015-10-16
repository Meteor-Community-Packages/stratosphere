/**
 * Collection
 */
ReleaseVersions = new Mongo.Collection("releaseVersions");

/**
 * Indexes
 */
if(Meteor.isServer){
    ReleaseVersions._ensureIndex({ "track": 1 });
    ReleaseVersions._ensureIndex({ "private": 1 });
    ReleaseVersions._ensureIndex({ "track": 1, "version":1 });
    ReleaseVersions._ensureIndex({ "hidden":1, "lastUpdated":1});
}