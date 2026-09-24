import { Meteor } from 'meteor/meteor';
import { PackageVersion } from 'meteor/package-version-parser';
import SimpleSchema from 'simpl-schema';

/**
 * Cleans `obj` in place (filtering unknown keys, applying defaults) and validates it.
 * Throws a client-visible 400 error when validation fails.
 */
export function validate(schema, obj, cleanOptions) {
  if (typeof obj !== 'object' || obj === null) {
    throw new Meteor.Error(400, 'Expected an object');
  }
  schema.clean(obj, { mutate: true, ...cleanOptions });
  try {
    schema.validate(obj);
  } catch (e) {
    throw new Meteor.Error(400, e.message);
  }
  return obj;
}

const validWith = check =>
  function () {
    if (this.value === undefined) return undefined;
    try {
      check(this.value);
    } catch {
      return SimpleSchema.ErrorTypes.VALUE_NOT_ALLOWED;
    }
  };

const packageName = { type: String, custom: validWith(name => PackageVersion.validatePackageName(name)) };
const packageVersion = { type: String, custom: validWith(version => PackageVersion.getValidServerVersion(version)) };
const sortDirection = { type: SimpleSchema.Integer, optional: true, allowedValues: [-1, 1] };

export const PublishOptionsSchema = new SimpleSchema({
  limit: { type: SimpleSchema.Integer, min: 1, defaultValue: 10 },
  skip: { type: SimpleSchema.Integer, min: 0, defaultValue: 0 },
  sort: { type: Object, defaultValue: { name: 1 } },
  'sort.name': sortDirection,
  'sort.lastUpdated': sortDirection,
});

export const SyncTokenSchema = new SimpleSchema({
  lastDeletion: { type: Number, optional: true },
  format: String,
  packages: { type: Number, optional: true },
  versions: { type: Number, optional: true },
  builds: { type: Number, optional: true },
  releaseTracks: { type: Number, optional: true },
  releaseVersions: { type: Number, optional: true },
  stratosphere: { type: Boolean, optional: true, defaultValue: false },
  _id: { type: String, optional: true },
});

export const SyncOptionsSchema = new SimpleSchema({
  compressCollections: { type: Boolean, optional: true, defaultValue: false },
  useShortPages: { type: Boolean, optional: true, defaultValue: false },
});

export const CreatePackageSchema = new SimpleSchema({ name: packageName });
export const CreateReleaseTrackSchema = new SimpleSchema({ name: String });

export const ChangePackageHomepageSchema = new SimpleSchema({
  name: packageName,
  homepage: { type: String, optional: true },
});

export const VersionIdentifierSchema = new SimpleSchema({
  packageName,
  version: packageVersion,
});

export const ChangeVersionMigrationStatusSchema = new SimpleSchema({
  packageName,
  version: packageVersion,
  unmigrated: { type: Boolean, optional: true },
});

export const ChangeVersionMetadataSchema = new SimpleSchema({
  git: { type: String, optional: true },
  description: { type: String, max: 100 },
  longDescription: { type: String, optional: true, max: 1500 },
});

export const CreatePackageBuildSchema = new SimpleSchema({
  packageName,
  version: packageVersion,
  buildArchitectures: String,
});

const optionalBoolean = { type: Boolean, optional: true, defaultValue: false };

export const CreatePackageVersionSchema = new SimpleSchema({
  packageName,
  version: packageVersion,
  description: { type: String, max: 100 },
  longDescription: { type: String, optional: true, max: 1500 },
  earliestCompatibleVersion: { type: String, defaultValue: '1.0.0' },
  ecRecordFormat: { type: String, defaultValue: '1.0' },
  git: { type: String, optional: true },
  compilerVersion: String,
  containsPlugins: optionalBoolean,
  debugOnly: optionalBoolean,
  prodOnly: optionalBoolean,
  testOnly: optionalBoolean,
  devOnly: optionalBoolean,
  deprecated: { type: Boolean, optional: true },
  deprecatedMessage: { type: String, optional: true },
  exports: { type: Array, optional: true, defaultValue: [] },
  'exports.$': Object,
  'exports.$.name': String,
  'exports.$.architectures': Array,
  'exports.$.architectures.$': String,
  releaseName: { type: String, optional: true },
  dependencies: Array,
  'dependencies.$': Object,
  'dependencies.$.packageName': { type: String, optional: true },
  'dependencies.$.constraint': { type: String, optional: true },
  'dependencies.$.references': Array,
  'dependencies.$.references.$': Object,
  'dependencies.$.references.$.arch': {
    type: String,
    allowedValues: ['plugin', 'os', 'web.browser', 'web.browser.legacy', 'web.cordova'],
  },
  'dependencies.$.references.$.implied': { type: Boolean, optional: true },
  'dependencies.$.references.$.weak': { type: Boolean, optional: true },
  'dependencies.$.references.$.unordered': { type: Boolean, optional: true },
});

export const CreateReleaseVersionSchema = new SimpleSchema({
  track: String,
  version: String,
  orderKey: String,
  description: String,
  recommended: { type: Boolean, defaultValue: false },
  tool: String,
  packages: { type: Object, blackbox: true },
});

export const PackageVersionHashesSchema = new SimpleSchema({
  tarballHash: String,
  treeHash: String,
  readmeHash: { type: String, optional: true },
});

export const ModifyMaintainerSchema = new SimpleSchema({
  name: String,
  username: String,
});

export const RecommendVersionSchema = new SimpleSchema({
  track: String,
  version: String,
  recommended: Boolean,
});
