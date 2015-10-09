Meteor.publish('stratosphere/nbPackages', function() {
    try{
        Stratosphere.utils.checkAccess();
        Counts.publish(this, 'nbPackages', Packages.find({private:true}));
    }catch(e){
        return [];
    }

});