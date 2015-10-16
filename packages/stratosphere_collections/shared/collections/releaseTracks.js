/**
 * Collection
 */
ReleaseTracks= new Mongo.Collection("releaseTracks");

/**
 * Indexes
 */
if(Meteor.isServer){
    ReleaseTracks._ensureIndex({ "name": 1 });
    ReleaseTracks._ensureIndex({ "private": 1 });
    ReleaseTracks._ensureIndex({ "hidden":1, "lastUpdated":1});
}