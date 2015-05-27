# THIS IS A WIP
Next thing to figure out is how to handle logins from Meteor tool

# Stratosphere
Stratosphere is a private package server for Meteor.

## Installation
This is a Meteor project, so you can deploy and run as any other Meteor project.
First start-up can take long, since it needs to import all packages from the official package repo.

After this, you need to create the database file.
First you need to find the existing database file (packages.data.db) here:
On Linux
```
~/.meteor/package-metadata/v2.0.1
```

On Windows:
```
%appdata%\..\Local\.meteor\package-metadata\v2.0.1
```
Next, you copy the existing database file and give it the filename you see when going to the front-end of your package server.
Note that Meteor does not currently support package servers running on another port than port 80, [see this PR](https://github.com/meteor/meteor/pull/4460)

## Usage
To publish and sync with Stratosphere, you have to set the package server URL to your stratosphere URL.
This can be achieved by setting the environment variable: METEOR_PACKAGE_SERVER to your package server url
On Linux:
```
METEOR_PACKAGE_SERVER=[YOUR URL]
```

On Windows:
```
SET METEOR_PACKAGE_SERVER=[YOUR URL]
```

You should be able to switch package servers back and forth.

## Settings
* upstreamURL: The URL to the official package manager, you probably don't want to change this
* readmeDirectory: Where readme files are saved to, for now, this must be publicly accessible.
* packageDirectory: Where package zips are saved to, for now, this must be publicly accessible.
* loginRequired: Whether a login is required, not yet implemented.

## Security remarks
Note that currently no effort has been made towards security.
This means that to protect your stratosphere install, you probably want to run it inside a firewall protected part of your organization.
Anyone can view all packages and add new ones. No checks are made towards the input variables or uploaded files!

## Contribute
We're open for contributions.
Here are some ideas:
1) Add security (user accounts, check input parameters, uploaded files, ...)
2) Look into the 'XXX'-es inside the code, these serve as TODOS
3) Tests
4) Whatever front-end functionality you consider useful