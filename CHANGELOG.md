2.0.0

* Update to Meteor 3.5.2 (async server code, no more fibers), built with Rspack
* New SolidJS front-end replacing AngularJS / angular-meteor
* Restructured from local packages into an app with ES modules (`imports/server`, `imports/ui`)
* Compatible with current meteor-tool: sync responses always include every collection, new version fields (`testOnly`, `devOnly`, `deprecated`, ...) are stored, `web.browser.legacy` dependency references are accepted
* Uploads are received as raw streams (as meteor-tool sends them); the `directories.tmp` setting is no longer used
* S3 sync calls the AWS CLI directly (dropped `aeris-s3-sync`), IP whitelisting uses `range_check` directly (dropped `simonrycroft:ip-whitelist`)
* Fixed: `publishReadme` (`meteor publish --update`), `removeMaintainer`, making a public package private on `createPackageVersion`, unpublishing release versions/tracks, CIDR ranges in the IP whitelist, path traversal in the file server, super users could be removed by other super users
* S3 sync and IP whitelisting are disabled in the settings template by default

1.0.0-rc2

* Update to Meteor v1.6.0.1

1.0.0-rc1

* No more need to copy package database if the instructions in the readme are followed
* Small improvements

1.0.0-beta2

* Fixed oAuth flow
* No more need to modify files of meteor-tool
* Extended front-end for user management
* Small improvements

1.0.0-beta1

* New, angular front-end
* Support for release tracks and versions
* Partially rewritten for ES2015
* Only supports Meteor 1.2 (meteor tool 1.1.7) and up
* Removed meteor tool config.js edit, since no longer necessary with meteor-tool 1.1.7
* Refactored packages

1.0.0-ALPHA2

* Implemented some meteor-tool admin methods
* Better data validation
* Refactored into packages

1.0.0-ALPHA1

Working so far, with changes to the auth-client of meteor-tool:

* Synchronization with upstream server
* Synchronization with meteor-tool
* Publishing and unpublishing of private packages, versions, builds, metadata changes
* Uploading and downloading of files

Next thing to figure out is how to handle logins from Meteor tool
