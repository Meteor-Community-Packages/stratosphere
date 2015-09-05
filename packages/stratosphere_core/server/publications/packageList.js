FindFromPublication.publish('packageList', function(options) {
    Stratosphere.utils.checkAccess();

    check(options, {
        sort: Object,
        limit: Number
    });
    return Packages.find({private:true/*, hidden:false*/},options);
});