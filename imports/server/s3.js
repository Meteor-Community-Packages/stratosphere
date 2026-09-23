// Optional two-way sync of the uploads directory with an S3 bucket, for multi-instance setups.
// Requires the AWS CLI (`aws`) on the PATH.
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import { promisify } from 'node:util';
import { Meteor } from 'meteor/meteor';

const exec = promisify(execFile);

async function s3Sync(from, to) {
  const { accessKey, secretKey, region } = Meteor.settings.s3Sync;
  const env = { ...process.env, AWS_ACCESS_KEY_ID: accessKey, AWS_SECRET_ACCESS_KEY: secretKey, AWS_DEFAULT_REGION: region };
  const { stdout } = await exec('aws', ['s3', 'sync', from, to, '--exclude', '*.part'], { env, maxBuffer: 64 * 1024 * 1024 });
  const files = stdout.split(/\r?\n/).filter(line => /^(download|upload): /.test(line));
  console.log(`Synced files from ${from} to ${to}: ${files.length ? files.join(', ') : 'n/a'}`);
}

let running = false;
let queued = false;

/** Pushes local uploads to S3; calls made while a sync is running are coalesced into one follow-up sync. */
async function syncToS3() {
  if (running) {
    queued = true;
    return;
  }
  running = true;
  queued = false;
  try {
    await s3Sync(Meteor.settings.directories.uploads, `s3://${Meteor.settings.s3Sync.bucket}`);
  } catch (e) {
    console.error('Sync to S3 failed', e);
  } finally {
    running = false;
    if (queued) syncToS3();
  }
}

export function startS3Sync() {
  if (!Meteor.settings.enableS3Sync) {
    console.log('Sync via S3 is disabled');
    return;
  }

  console.log('Start builds observer');
  fs.watch(Meteor.settings.directories.uploads, { recursive: true }, () => syncToS3());

  console.log('Sync S3 to and from local uploads folder');
  s3Sync(`s3://${Meteor.settings.s3Sync.bucket}`, Meteor.settings.directories.uploads).catch(e =>
    console.error('Sync from S3 failed', e),
  );
}
