Meteor.startup(function () {
  console.log('-Ensure MongoDB Indexes');
  Packages._ensureIndex({ "name": 1});
  Packages._ensureIndex({ "custom": 1 });
  Packages._ensureIndex({ "custom": 1, "hidden": 1 });
  Packages._ensureIndex({ "name": 1, "custom": 1 });
  Packages._ensureIndex({ name: "text" });
  //Packages._ensureIndex({ name: "text", "custom": 1 });
  Packages._ensureIndex({ "hidden":1, "lastUpdated":1});

  Versions._ensureIndex({ "packageName": 1 });
  Versions._ensureIndex({ "custom": 1, "hidden": 1 });
  Versions._ensureIndex({ "custom": 1 });
  Versions._ensureIndex({ "packageName": 1, "custom": 1 });
  Versions._ensureIndex({ "packageName": 1, "version": 1 });
  Versions._ensureIndex({ hidden:1, lastUpdated:1});

  Builds._ensureIndex({ "versionId": 1 });
  Builds._ensureIndex({ "versionId": 1, "buildArchitectures": 1 });
  Builds._ensureIndex({ "custom": 1 });
  Builds._ensureIndex({ "hidden":1, "lastUpdated":1});

  ReleaseVersions._ensureIndex({ "track": 1 });
  ReleaseVersions._ensureIndex({ "custom": 1 });
  ReleaseVersions._ensureIndex({ "track": 1, "version":1 });
  ReleaseVersions._ensureIndex({ "hidden":1, "lastUpdated":1});

  ReleaseTracks._ensureIndex({ "name": 1 });
  ReleaseTracks._ensureIndex({ "custom": 1 });
  ReleaseTracks._ensureIndex({ "hidden":1, "lastUpdated":1});
});