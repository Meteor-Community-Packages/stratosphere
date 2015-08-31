_.mixin({
    toArrayFromObj: function (object, keyName)
    {
        return _.values(_.map(Object.keys(object),function (item)
        {
            object[item][keyName] = item;
            return object[item];
        }));
    }
});

Stratosphere.utils = {};

/*
 * XXX nicer lodash alternative, see http://stackoverflow.com/questions/26155219/opposite-of-indexby-in-lodash-underscore

 _.mixin({
 disorder: function(collection, path) {
 return _.transform(collection, function(result, item, key) {
 if (path)
 _.set(item, path, key);

 result.push(item);
 }, []);
 }
 });
 */

/**
 * Validate a package name
 * @returns {boolean}
 */
Stratosphere.utils.validatePackageName = function validatePackageName(){
    try{
        PackageVersion.validatePackageName(this.value);
        return true;
    }catch(e){
        return false;
    }
}

/**
 * Validate a package version
 * @returns {boolean}
 */
Stratosphere.utils.validateVersion = function validateVersion(){
    try{
        PackageVersion.getValidServerVersion(this.value);
        return true;
    }catch(e){
        return false;
    }
}

/**
 * Verify version hashes
 * @param files - object with file names as keys and hashes as value
 * @returns {boolean}
 */
Stratosphere.utils.verifyHashes = function verifyHashes(files){
    for(var file in files){
        if(!files.hasOwnProperty(file))continue;
        if(!verifyHash(file,files[file])) return false;
    }
    return true;
}

/**
 * Verify version hash
 * @param file - file to verify hash from
 * @param hash - the supposedly corect hash
 * @returns {boolean}
 */
Stratosphere.utils.verifyHash = function verifyHash(file,hash){
    var fs = Npm.require("fs");
    var path = Npm.require('path');
    var crypto = Npm.require('crypto');

    var hasher = crypto.createHash('sha256');
    hash.setEncoding('base64');
    //file = files.convertToOSPath(args[0]);

    var rs = fs.createReadStream(file)

    Async.runSync(function(done){ rs.on('end',done);rs.pipe(hasher, { end: false });});

    rs.close();
    return hasher.digest('base64') === hash;
}

Stratosphere.utils.checkAccess = function checkAccess(){
    if(Meteor.settings.public.loginRequired && !Meteor.user()) throw new Meteor.Error("403");
}


Stratosphere.utils.versionMagnitude = function versionMagnitude(version){
    var SemVer = Npm.require("semver-loose");
    try{
        return versionMagnitude(PackageVersion.versionMagnitude(element.version));
    }catch(e){
        var v = SemVer.parse(version);
        return v.major * 100 * 100 +
            v.minor * 100 +
            v.patch;
    }
}