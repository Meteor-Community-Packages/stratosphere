# V1.0.0-beta2

# Stratosphere
Stratosphere is a private package server for Meteor. 
So this is like Atmosphere on your own servers, with private packages.

Besides your own packages, Stratosphere will also give you access to all packages on Atmosphere.

## Installation

To install Stratosphere you'll need to create a meteor developer app and a package database file.

### 1) Create a Meteor developer app
First create an app that can uses the meteor developer account services:
[https://www.meteor.com/account-settings/apps](https://www.meteor.com/account-settings/apps) (be sure to set a correct redirect url)

### 2) Create settings.json file
Rename the settings.json.template file to settings.json
Fill in the app id (`meteorDeveloperAccount.clientId`) and app secret (`meteorDeveloperAccount.secret`) from the previous step and the url the package server will run on (`public.url`)
Also fill in if people need to login by setting `public.loginRequired`. If you enable logins, you need to add at least one superUser. This is the username of your meteor-developer account.

**NOTE** meteor-tool only tries to authenticate when publishing data. `loginRequired` has no effect on who can see your packages!

### 3) Run the app
This is a Meteor project, so you can deploy and run it the same way as any other Meteor project.
You need to tell meteor it needs to use the settings.json file with the --settings option:

```
meteor --settings settings.json
```

After this, you need to create the database file.
First you need to find the existing database file (packages.data.db) here:

### 4) Create the package database
On Linux
```
~/.meteor/package-metadata/v2.0.1
```

On Windows:
```
%appdata%\..\Local\.meteor\package-metadata\v2.0.1
```
Next, you copy the existing database file and give it the filename you see when going to instructions in the front-end of your package server.

## Usage
To publish and sync with Stratosphere, you have to set the package server URL to your stratosphere URL.
This can be achieved by setting the environment variable: METEOR_PACKAGE_SERVER to your package server url:
```
METEOR_PACKAGE_SERVER_URL=[YOUR URL]
```

Meteor splits package database and files according to this URL, so you should be able to switch package servers back and forth by changing this variable.

First time syncing can take long (~10min), since it needs to import all package data from the official package repo and do some processing on them.

## Settings
* upstreamURL: The URL to the official package server. Default value is packages.meteor.com, you probably don't want to change this.
* directories.tmp: Directory where file uploads are temporarily uploaded to
* directories.uploads: Directory where files are moved to and downloaded from after they have been verified
* public.loginRequired: Whether a login is required. Default is false, true will result in errors for now.
* public.url: The url of the package server
* superUsers: Which user accounts (meteor developer account names) are allowed to publish on this server
* meteorDeveloperAccount.clientId: Client id of your meteor accounts app
* meteorDeveloperAccount.secret: Secret key of your meteor accounts app

If `loginRequired` is set to true, you need at least one superUser. SuperUsers can add and manage other users in the Stratosphere GUI.

## Security remarks
Note that currently little effort has been made towards security.
This means that to protect your stratosphere install, you probably want to run it inside a firewall protected part of your organization.

## Contribute
We welcome contributions.

Here are some other ideas:
- Look into the 'XXX'-es inside the code, these serve as TODOS
- Add Tests
- Improve security (e.g. check upload tokens before upload starts, verify hashes)
- Convert raw object manipulation to a more clean solution (e.g. using Astronomy)
- Whatever front-end functionality that might be useful