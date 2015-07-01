# V1.0.0-alpha2

# THIS IS A WIP
Working so far, with changes to the auth-client of meteor-tool:

* Synchronization with upstream server
* Synchronization with meteor-tool
* Publishing and unpublishing of packages, versions, builds, metadata changes
* Uploading and downloading of files
* Some fo the admin commands

Next thing to figure out is how to handle logins from Meteor tool

# Stratosphere
Stratosphere is a private package server for Meteor.

## Installation
### 1) Change files to meteor tool
These changes are a temporary fix to make the package server work. In the future these changes shouldn't be necessary.

Replace the files in meteor tool with these files:
https://gist.github.com/sebakerckhof/d4cd1f41ba0e1ecaa8ae

Note that these files are for meteor tool 1.1.3.

On Linux/Mac
```
~/.meteor/packages/meteor-tool/1.1.3/mt-os.(linux|osx).x86_(32|64)/tools
```

On Windows:
```
%appdata%\..\Local\.meteor\meteor-tool\mt-os.windows.x86_32\tools
```

This is currently necessary because of:

* config.js - remove illegal character on windows - solved in next release, see: https://github.com/meteor/meteor/pull/4460
* auth-client.js - problems with meteor oAuth flow - tracked here: https://github.com/meteor/meteor/issues/4497

The config.js problem is solved in the next release, but any help to solve the problem with auth-client.js would be highly appreciated.

### 2) Create a Meteor developer app
First create an app that can use the meteor developer account services:
[https://www.meteor.com/account-settings/apps](https://www.meteor.com/account-settings/apps) (be sure to set a correct redirect url)

### 3) Create settings.json file
Rename the settings.json.template file to settings.json
Fill in the app id (meteorDeveloperAccount.clientId) and app secret (meteorDeveloperAccount.secret) from step 2 and the url the package server will run on (public.url)

### 4) Run the app
This is a Meteor project, so you can deploy and run it the same way as any other Meteor project.
You need to tell meteor it needs to use the settings.json file with the --settings option:

```
meteor --settings settings.json
```

After this, you need to create the database file.
First you need to find the existing database file (packages.data.db) here:

### 5) Create the package database
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
This can be achieved by setting the environment variable: METEOR_PACKAGE_SERVER to your package server url:
```
METEOR_PACKAGE_SERVER_URL=[YOUR URL]
```

Meteor splits package database and files according to this URL, so you should be able to switch package servers back and forth by changing this variable.
Note that because of the temporary changes to the auth-client.js file of meteor tool (see installation instructions), publishing to the official repository won't work anymore for the time being...

First time syncing can take long (~10min), since it needs to import all packages from the official package repo and do some processing on them.

## Settings
* upstreamURL: The URL to the official package server. Default value is packages.meteor.com, you probably don't want to change this.
* directories.tmp: Directory where file uploads are temporarily uploaded to
* directories.uploads: Directory where files are moved to and downloaded from after they have been verified
* public.loginRequired: Whether a login is required. Default is false, true will result in errors for now.
* allowedUsers: Which user accounts are allowed on this server
* meteorDeveloperAccount.clientId: Client id of your meteor accounts app
* meteorDeveloperAccount.secret: Secret key of your meteor accounts app

## Security remarks
Note that currently little effort has been made towards security.
This means that to protect your stratosphere install, you probably want to run it inside a firewall protected part of your organization.

## Contribute
We're open for contributions.
Top priority now is fixing the OAuth flow from meteor tool to the package server.

Here are some other ideas:
- Look into the 'XXX'-es inside the code, these serve as TODOS
- Add Tests
- Add better security (e.g. check upload tokens before upload starts, verify hashes, fix oauth flow of meteor-tool)
- Convert raw object manipulation to a more clean solution (using Astronomy, some code for this is already present and commented out in model/models.js)
- Whatever front-end functionality you consider useful