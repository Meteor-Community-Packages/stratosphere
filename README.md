# V1.0.0-beta1

# Stratosphere
Stratosphere is a private package server for Meteor. 
So this is like Atmosphere on your own servers, with private packages.

Besides your own packages, Stratosphere will also give you access to all packages on Atmosphere.

## THIS IS A WIP
Working so far:

* Synchronization with upstream (atmosphere) server
* Synchronization with meteor-tool
* Publishing and unpublishing of packages, package versions, release tracks, release versions, builds, metadata changes
* Uploading and downloading of files
* Some of the admin commands

Next thing to figure out is how to handle logins from Meteor tool and make the overall installation process less cumbersome.

## Installation
### 1) Patch auth-client.js in meteor tool
This change is a temporary fix to make the package server work. In the future this shouldn't be necessary.

Replace auth-client.js in meteor tool with this file: https://gist.github.com/sebakerckhof/9ed52a45fcb7d940fc60

Note that these instructions are for meteor tool 1.1.7. and up

On Linux/Mac
```
~/.meteor/packages/meteor-tool/1.1.7/mt-os.(linux|osx).x86_(32|64)/tools
```

On Windows:
```
%appdata%\..\Local\.meteor\packages\meteor-tool\1.1.7\mt-os.windows.x86_32\tools
```

This is currently necessary because of [this issue](https://github.com/meteor/meteor/issues/4497)

Any help to solve the problem with auth-client.js would be highly appreciated.

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
Next, you copy the existing database file and give it the filename you see when going to instructions in the front-end of your package server.

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
* public.url: The url of the package server
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
- Convert raw object manipulation to a more clean solution (e.g. using Astronomy)
- Whatever front-end functionality that might be useful