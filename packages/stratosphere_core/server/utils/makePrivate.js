/**
 * Make an existing package private
 * @param data
 * @returns {*|any}
 */

Stratosphere.utils.makePrivateX = function makePrivateX(target,data){
    const targets = {
        'package' : {
            collection: Packages,
            childCollection: Versions,
            childReference: 'packageName',
            schema: Stratosphere.schemas.CreatePackageSchema
        },
        'track' : {
            collection: ReleaseTracks,
            childCollection: ReleaseVersions,
            childReference: 'track',
            schema: Stratosphere.schemas.CreateReleaseTrackSchema
        }
    }

    targets[target].schema.clean(data);
    check(data,targets[target].schema);

    const record = targets[target].collection.findOne(data);
    if(record && record.private){
        throw new Meteor.Error(`Private ${target} already exists.`);
    }

    const date = new Date();
    const insert = {name:data.name, hidden:true, private:true, lastUpdated: date};

    //If an upstream record already exist, rename it with an "-UPSTREAM"-suffix
    if(record){
        console.log(`Renaming existing public ${target}`);
        insert.upstream = record._id;
        targets[target].collection.update(record._id,{$set:{name:`${record.name}-UPSTREAM`,lastUpdated:date}});

        const childQuery = {};
        childQuery[targets[target].childReference] = record.name;

        const childUpdate = {lastUpdated:date};
        childUpdate[targets[target].childReference] = `${record.name}-UPSTREAM`;
        targets[target].childCollection.update(childQuery,{$set:childUpdate},{multi:true});
    }

    insert.maintainers = [];
    if(Meteor.user()){
        insert.maintainers.push({username:Meteor.user().username,id:Meteor.userId()});
    }

    insert._id = targets[target].collection.insert(insert);

    return insert._id;
}

Stratosphere.utils.makePrivatePackage = function makePrivatePackage(data){
    return Stratosphere.utils.makePrivateX('package',data);
}

Stratosphere.utils.makePrivateTrack = function makePrivateTrack(data){
    return Stratosphere.utils.makePrivateX('track',data);
}