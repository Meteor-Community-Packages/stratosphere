Meteor.startup(function () {
  console.log('-Ensure MongoDB Indexes');
  Packages._ensureIndex({ "name": 1});
  Packages._ensureIndex({ "private": 1 });
  Packages._ensureIndex({ "private": 1, "hidden": 1 });
  Packages._ensureIndex({ "name": 1, "private": 1 });
  Packages._ensureIndex({ name: "text" });
  //Packages._ensureIndex({ name: "text", "private": 1 });
  Packages._ensureIndex({ "hidden":1, "lastUpdated":1});

  Versions._ensureIndex({ "packageName": 1 });
  Versions._ensureIndex({ "private": 1, "hidden": 1 });
  Versions._ensureIndex({ "private": 1 });
  Versions._ensureIndex({ "packageName": 1, "private": 1 });
  Versions._ensureIndex({ "packageName": 1, "version": 1 });
  Versions._ensureIndex({ hidden:1, lastUpdated:1});

  Builds._ensureIndex({ "versionId": 1 });
  Builds._ensureIndex({ "versionId": 1, "buildArchitectures": 1 });
  Builds._ensureIndex({ "private": 1 });
  Builds._ensureIndex({ "hidden":1, "lastUpdated":1});

  Metadata._ensureIndex({ "key": 1 });

  ReleaseVersions._ensureIndex({ "track": 1 });
  ReleaseVersions._ensureIndex({ "private": 1 });
  ReleaseVersions._ensureIndex({ "track": 1, "version":1 });
  ReleaseVersions._ensureIndex({ "hidden":1, "lastUpdated":1});

  ReleaseTracks._ensureIndex({ "name": 1 });
  ReleaseTracks._ensureIndex({ "private": 1 });
  ReleaseTracks._ensureIndex({ "hidden":1, "lastUpdated":1});
});