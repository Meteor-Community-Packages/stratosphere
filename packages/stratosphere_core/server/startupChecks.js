Meteor.startup(function(){


    if(!Meteor.settings.public.loginRequired){
        Meteor.users.remove({type:'stub'});
    }else{
        if(!Meteor.settings.superUsers.length){
            throw "If login is required you need to set at least one super user in the settings.json file";
        }

        var superUsers = Meteor.users.find({"permissions.superUser":true},{fields:{"username":1}}).fetch();

        superUsers = _.indexBy(superUsers,"username");
        var removeUsers = _.map(_.without(Object.keys(superUsers),Meteor.settings.superUsers),function(username){ return superUsers[username]._id});
        var addUserNames =_.without(Meteor.settings.superUsers,Object.keys(superUsers));

        Meteor.users.update({_id:{$in:removeUsers}},{$unset:{"permissions.superUser":true}},{multi:true});
        Meteor.users.update({username:{$in:addUserNames}},{$set:{"permissions.superUser":true}},{multi:true});

        addUserNames.forEach(function(username){
           if(!Meteor.users.findOne({username:username})){
              Stratosphere.utils.createUserStub(username,{superUser:true});
           }
        });
    }



});