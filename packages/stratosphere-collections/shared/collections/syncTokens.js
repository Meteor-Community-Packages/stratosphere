/**
 * Schemas
 */

Stratosphere.schemas.SyncTokenSchema = new SimpleSchema({
  'lastDeletion': {
    type: Number
  },
  'format': {
    type: String
  },
  'packages': {
    type: Number
  },
  'versions': {
    type: Number
  },
  'builds': {
    type: Number
  },
  'releaseTracks': {
    type: Number
  },
  'releaseVersions': {
    type: Number
  },
  'stratosphere': {
    type: Boolean,
    optional:true,
    defaultValue:false
  },
  '_id': {
    type: String,
    optional:true
  }
});