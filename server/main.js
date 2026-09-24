import { Meteor } from 'meteor/meteor';
import { setupAccounts } from '/imports/server/accounts';
import { createIndexes } from '/imports/server/collections';
import { startS3Sync } from '/imports/server/s3';
import { connectToUpstream, setupMetadata } from '/imports/server/sync';
import { startUploadServer } from '/imports/server/uploads';
import { startWhitelisting } from '/imports/server/whitelist';
import '/imports/server/publications';
import '/imports/server/methods/gui';
import '/imports/server/methods/meteortool';

Meteor.startup(async () => {
  if (!Meteor.settings.public?.url) {
    throw new Error('Missing settings, run with: meteor --settings settings.json');
  }
  Meteor.settings.public.url = Meteor.settings.public.url.replace(/\/+$/, '');

  await createIndexes();
  await setupMetadata();
  await setupAccounts();
  await startWhitelisting();
  startUploadServer();
  startS3Sync();
  connectToUpstream();
});
