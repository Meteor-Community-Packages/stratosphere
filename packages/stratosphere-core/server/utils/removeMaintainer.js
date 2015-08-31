Stratosphere.schemas.ModifyMaintainerSchema = new SimpleSchema([Stratosphere.schemas.PackageSchema.pick(['name']),{'username':{type:String}}]);

Stratosphere.utils.removeMaintainerFromX = function removeMaintainerFromX(id,username,target){
    var targets = {
        'package' : Packages,
        'track' : ReleaseTracks
    };

    var params = {
        name:id,
        username:username
    };
    Stratosphere.schemas.ModifyMaintainerSchema.clean(params);
    check(params,Stratosphere.schemas.ModifyMaintainerSchema);

    console.log('Removing user from maintainer list');
    if(!targets[target].update({name:id,private:true},{ $pull: { maintainers: {username:maintainer.username} }}))
        throw new Meteor.Error('404', 'Private '+ target +' not found!');
}