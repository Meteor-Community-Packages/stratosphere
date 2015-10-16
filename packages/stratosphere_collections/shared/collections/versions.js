/**
 * Collection
 */
Versions = new Mongo.Collection("versions");

/**
 * Indexes
 */
if(Meteor.isServer){
    Versions._ensureIndex({ "packageName": 1 });
    Versions._ensureIndex({ "private": 1, "hidden": 1 });
    Versions._ensureIndex({ "private": 1 });
    Versions._ensureIndex({ "packageName": 1, "private": 1 });
    Versions._ensureIndex({ "packageName": 1, "version": 1 });
    Versions._ensureIndex({ "versionMagnitude": 1 });
    Versions._ensureIndex({ hidden:1, lastUpdated:1});
}