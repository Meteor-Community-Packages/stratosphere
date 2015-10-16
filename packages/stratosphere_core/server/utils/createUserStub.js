Stratosphere.utils.createUserStub = function (username,permissions){
    if(!permissions){
        permissions = {canSynchronize:true};
    }

    Accounts.insertUserDoc({}, {
        username:username,
        permissions:permissions,
        type:'stub'
    });
}