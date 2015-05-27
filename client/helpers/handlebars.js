Template.registerHelper('pluralize', function(n, thing) {
  // fairly stupid pluralizer
  if (n === 1) {
    return '1 ' + thing;
  } else {
    return n + ' ' + thing + 's';
  }
});

Template.registerHelper('dbName',function(){
  var url = window.location.host;
  //url = url.replace(/^\https:\/\//, '');
  //url = url.replace(/^\http:\/\//, '');
  url = url.replace(/\/+$/, '');

  // Chop off meteor.com.
  //url = url.replace(/\.meteor\.com$/, '');

  // Replace other weird stuff with X.
  url = url.replace(/[^a-zA-Z0-9.-]/g, 'X');

  return url+'.data.db';
});