FindFromPublication.publish('stratosphere/packages', function(options) {
    try{
        Stratosphere.utils.checkAccess();

        check(options, {
            sort: Object,
            limit: Number
        });
        return Packages.find({private:true/*, hidden:false*/},options);
    }catch(e){
        return [];
    }

});