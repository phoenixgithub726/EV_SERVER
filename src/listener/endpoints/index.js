require('fs').readdirSync(__dirname + '/').forEach(function(file) {
  if (file.match(/\.js$/) !== null && file !== 'index.js') {
    var name = file.replace('.js', '');
    console.log(name+ ' has been loaded')
    exports[name] = require('./' + file);
  }
});