import { createSignal, Show } from 'solid-js';
import { A, Navigate, Route, Router } from '@solidjs/router';
import { Meteor } from 'meteor/meteor';
import { currentUser, isSuperUser, loginRequired, notification, notify } from './lib';
import { Modal } from './Modal';
import { List } from './List';
import { Details } from './Details';
import { Users } from './Users';

function login() {
  Meteor.loginWithMeteorDeveloperAccount({}, err => {
    if (err) notify(`Login error: ${err.reason ?? err.message}`);
  });
}

const Layout = props => {
  const [showInstructions, setShowInstructions] = createSignal(false);
  return (
    <>
      <header class="toolbar">
        <h1>Stratosphere</h1>
        <nav>
          <A href="/package/list/lastUpdated">Recently updated</A>
          <A href="/package/list/name">Alphabetical</A>
          <A href="/track/list/name">Release tracks</A>
          <Show when={loginRequired() && isSuperUser()}>
            <A href="/users">Users</A>
          </Show>
          <button onClick={() => setShowInstructions(true)}>Instructions</button>
          <Show when={currentUser()}>
            <button onClick={() => Meteor.logout()}>Logout {currentUser().username}</button>
          </Show>
          <Show when={loginRequired() && !currentUser()}>
            <button onClick={login}>Login</button>
          </Show>
        </nav>
      </header>
      <main class="page">{props.children}</main>
      <Show when={showInstructions()}>
        <Instructions onClose={() => setShowInstructions(false)} />
      </Show>
      <Show when={notification()}>
        <div class="toast" role="status">
          {notification()}
        </div>
      </Show>
    </>
  );
};

const Instructions = props => {
  // Adapted from meteor-tool: the local package database file is named after the server URL
  const dbName = `${Meteor.settings.public.url
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '')
    .replace(/[^a-zA-Z0-9.-]/g, 'X')}.data.db`;

  return (
    <Modal title="Stratosphere usage instructions" onClose={props.onClose}>
      <h3>Installation</h3>
      <p>
        Follow the instructions in the{' '}
        <a href="https://github.com/Meteor-Community-Packages/stratosphere" target="_blank" rel="noreferrer">
          README
        </a>
        .
      </p>
      <h3>Usage</h3>
      <p>
        To publish and sync with Stratosphere, set the <code>METEOR_PACKAGE_SERVER_URL</code> environment variable to{' '}
        <code>{Meteor.settings.public.url}</code>.
      </p>
      <p>
        <strong>Important:</strong> you can not immediately publish stand-alone packages. Meteor first needs to create
        and fill up a new package database file (<code>{dbName}</code>). This is done automatically when you run an
        existing Meteor project with the environment variable set. The first sync can take a while, since it imports
        all package data from the official package server.
      </p>
      <p>
        Meteor splits the package database and package files according to this URL, so you can switch package servers
        back and forth by changing this variable.
      </p>
      <h3>Access control</h3>
      <p>
        There is no way to protect who can see and synchronize packages, so you probably want to run Stratosphere
        inside a firewall protected part of your organization. You can protect who can publish and unpublish packages
        by setting <code>public.loginRequired</code> in the settings file, with at least one meteor developer account
        in <code>superUsers</code>. Super users can manage other users' rights here.
      </p>
      <h3>Credits</h3>
      <p>
        Created by{' '}
        <a href="https://github.com/sebakerckhof" target="_blank" rel="noreferrer">
          Seba Kerckhof
        </a>
        , maintained by Meteor Community Packages.
      </p>
    </Modal>
  );
};

export const App = () => (
  <Router root={Layout}>
    <Route path="/:type/list/:sort?" matchFilters={{ type: ['package', 'track'] }} component={List} />
    <Route path="/:type/details/:name" matchFilters={{ type: ['package', 'track'] }} component={Details} />
    <Route path="/users" component={Users} />
    <Route path="*" component={() => <Navigate href="/package/list/lastUpdated" />} />
  </Router>
);
