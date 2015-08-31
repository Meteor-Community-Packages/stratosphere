Stratosphere.utils.addMaintainerToX = function addMaintainerToX(id,username,target){
    var targets = {
        'package' : Packages,
        'track' : ReleaseTracks
    }

    var params = {
        name:id,
        username:username
    };
    Stratosphere.schemas.ModifyMaintainerSchema.clean(params);
    check(params,Stratosphere.schemas.ModifyMaintainerSchema);

    var maintainer = {username:params.username}; //XXX: retrieve user
    console.log('Adding user from maintainer list');
    if(!targets[target].update({name:params.name,private:true},{ $push: { maintainers: maintainer }}))
        throw new Meteor.Error('404', 'Private '+ target +' not found!');
}