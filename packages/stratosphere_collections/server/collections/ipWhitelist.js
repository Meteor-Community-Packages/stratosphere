/**
 * Collection
 */
IpWhitelist = new Mongo.Collection("ipWhitelist");

/**
 * Indexes
 */
Metadata._ensureIndex({"ipAddress": 1 });