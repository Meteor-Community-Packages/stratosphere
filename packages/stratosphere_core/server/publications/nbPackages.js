Meteor.publish('/stratosphere/nbPackages', function() {
    try{
        Stratosphere.utils.checkAccess('canSynchronize',this.userId);
        Counts.publish(this, 'nbPackages', Packages.find({private:true}));
    }catch(e){
        return [];
    }

});