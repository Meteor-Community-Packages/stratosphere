/**
 * Schemas
 */

Stratosphere.schemas.SyncTokenSchema = new SimpleSchema({
  'lastDeletion': {
    type: Number,
    optional:true
  },
  'format': {
    type: String
  },
  'packages': {
    type: Number,
    optional:true
  },
  'versions': {
    type: Number,
    optional:true
  },
  'builds': {
    type: Number,
    optional:true
  },
  'releaseTracks': {
    type: Number,
    optional:true
  },
  'releaseVersions': {
    type: Number,
    optional:true
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