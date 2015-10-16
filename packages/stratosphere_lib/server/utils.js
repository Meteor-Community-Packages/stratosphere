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
    for(let file of files.keys()){
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
    const fs = Npm.require("fs");
    const path = Npm.require('path');
    const crypto = Npm.require('crypto');

    const hasher = crypto.createHash('sha256');
    hash.setEncoding('base64');
    //file = files.convertToOSPath(args[0]);

    const rs = fs.createReadStream(file)

    Async.runSync(function(done){ rs.on('end',done);rs.pipe(hasher, { end: false });});

    rs.close();
    return hasher.digest('base64') === hash;
}

// If the given version matches a template (essentially, semver-style, but with
// a bounded number of digits per number part, and with no restriction on the
// amount of number parts, and some restrictions on legal prerelease labels),
// then return a magnitude for it. Otherwise return null.
//
// This conventional magnitude pads each part (with 0s for numbers, and ! for
// prerelease tags), and appends a $. (Because ! sorts before $, this means that
// the prerelease for a given release will sort before it. Because $ sorts
// before '.', this means that 1.2 will sort before 1.2.3.)
Stratosphere.utils.versionMagnitude = function versionMagnitude(v){
    var m = v.match(/^(\d{1,4}(?:[\._]\d{1,4})*)(?:-([-A-Za-z.]{1,15})(\d{0,4}))?$/);
    if (!m) return null;
    var numberPart = m[1];
    var prereleaseTag = m[2];
    var prereleaseNumber = m[3];

    var hasRedundantLeadingZero = function (x) {
        return x.length > 1 && x[0] === '0';
    };
    var leftPad = function (chr, len, str) {
        if (str.length > len) throw Error("too long to pad!");
        var padding = new Array(len - str.length + 1).join(chr);
        return padding + str;
    };
    var rightPad = function (chr, len, str) {
        if (str.length > len) throw Error("too long to pad!");
        var padding = new Array(len - str.length + 1).join(chr);
        return str + padding;
    };

    // Versions must have no redundant leading zeroes, or else this encoding would
    // be ambiguous.
    var numbers = numberPart.split(/[\._]/);
    if (_.any(numbers, hasRedundantLeadingZero)) return null;
    if (prereleaseNumber && hasRedundantLeadingZero(prereleaseNumber)) return null;

    // First, put together the non-prerelease part.
    var ret = _.map(numbers, _.partial(leftPad, '0', 4)).join('.');

    if (!prereleaseTag) return ret + '$';

    ret += '!' + rightPad('!', 15, prereleaseTag);
    if (prereleaseNumber) ret += leftPad('0', 4, prereleaseNumber);

    return ret + '$';
}