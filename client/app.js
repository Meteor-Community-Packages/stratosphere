var options = {
  keepHistory: 1000 * 60 * 5,
  localSearch: true
};
var fields = ['packageName', 'description'];

/*
PackageSearch = new SearchSource('packages', fields, options);

Template.searchResult.helpers({
  getPackages: function() {
    // get data from the source - this return a reactive data source
    return PackageSearch.getData({
      // transform and highlight searched words
      // all regExp matching has done for you
      // you only have to do the word replacement only (to bold searching words)
      transform: function(matchText, regExp) {
        return matchText.replace(regExp, "<b>$&</b>")
      },
      sort: {_score: -1}
    });
  },

  isLoading: function() {
    return PackageSearch.getStatus().loading;
  }
});

Template.searchResult.rendered = function() {
  PackageSearch.search('');
};

Template.searchBox.events({
  "keyup #search-box": _.throttle(function(e) {
    var text = $(e.target).val().trim();
    // sending search request to the server
    PackageSearch.search(text);
  }, 200)
});*/