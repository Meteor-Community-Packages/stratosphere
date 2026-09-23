import { createComputed, createRoot, createSignal, onCleanup } from 'solid-js';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Tracker } from 'meteor/tracker';
import { Packages, ReleaseTracks, ReleaseVersions, Versions } from '../api/collections';

/**
 * Exposes a Tracker-reactive computation (Minimongo queries, subscriptions, Meteor.user())
 * as a Solid accessor. Re-runs when either Tracker or Solid dependencies change;
 * subscriptions made inside are stopped with the owning component.
 */
export function createTracker(fn) {
  const [value, setValue] = createSignal(undefined, { equals: false });
  createComputed(() => {
    const computation = Tracker.nonreactive(() => Tracker.autorun(() => setValue(() => fn())));
    onCleanup(() => computation.stop());
  });
  return value;
}

// Filled by the server's publishCount()
export const Counts = new Mongo.Collection('counts');
export const getCount = name => Counts.findOne(name)?.count ?? 0;

export const currentUser = createRoot(() =>
  createTracker(() => {
    Meteor.subscribe('/stratosphere/loggedInUser');
    return Meteor.user();
  }),
);

export const loginRequired = () => !!Meteor.settings.public.loginRequired;
export const isSuperUser = () => !!currentUser()?.permissions?.superUser;
export const canUnpublish = () =>
  !loginRequired() || isSuperUser() || !!currentUser()?.permissions?.canUnpublish;

export const [notification, setNotification] = createSignal();
let notificationTimer;
export function notify(message) {
  setNotification(message);
  clearTimeout(notificationTimer);
  notificationTimer = setTimeout(() => setNotification(), 5000);
}

/** Runs a method, reporting success or failure as a notification. */
export async function callMethod(successMessage, failureMessage, name, ...args) {
  try {
    const result = await Meteor.callAsync(name, ...args);
    if (successMessage) notify(successMessage);
    return result;
  } catch (e) {
    notify(`${failureMessage}: ${e.reason ?? e.message}`);
    throw e;
  }
}

export const types = {
  package: {
    id: 'package',
    label: 'package',
    versionLabel: 'version',
    collection: Packages,
    versionsCollection: Versions,
    count: 'nbPackages',
    versionsCount: 'nbVersions',
    linkedBy: 'packageName',
    unpublish: '/stratosphere/unPublishPackage',
    unpublishVersion: '/stratosphere/unPublishVersion',
    subscribeList: '/stratosphere/packages',
    subscribeDetails: '/stratosphere/package',
    subscribeVersions: '/stratosphere/versions',
    subscribeVersion: '/stratosphere/version',
  },
  track: {
    id: 'track',
    label: 'release track',
    versionLabel: 'release version',
    collection: ReleaseTracks,
    versionsCollection: ReleaseVersions,
    count: 'nbTracks',
    versionsCount: 'nbReleaseVersions',
    linkedBy: 'track',
    unpublish: '/stratosphere/unPublishReleaseTrack',
    unpublishVersion: '/stratosphere/unPublishReleaseVersion',
    subscribeList: '/stratosphere/releaseTracks',
    subscribeDetails: '/stratosphere/releaseTrack',
    subscribeVersions: '/stratosphere/releaseVersions',
    subscribeVersion: '/stratosphere/releaseVersion',
  },
};

export const plural = (n, label) => `${n} ${label}${n === 1 ? '' : 's'}`;

export const formatDate = date => (date ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date) : '');
