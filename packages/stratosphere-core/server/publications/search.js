SearchSource.defineSource('packages', function(searchText, options) {
    const options = {sort: {name: 1}, limit: 20};

    if(searchText) {
        return Packages.find({$text: {$search: searchText}, private:true/*, hidden:false*/}).fetch();
    } else {
        return Packages.find({}, options).fetch();
    }
});
