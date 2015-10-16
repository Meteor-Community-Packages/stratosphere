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