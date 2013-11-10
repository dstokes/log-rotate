var fs = require('fs')
  , path = require('path');

module.exports = function(file, options, cb) {
  if(typeof cb === 'undefined') {
    cb = options;
    options = {}
  }

  var dir  = path.dirname(file)
    , name = path.basename(file)
    // regex for matching rotations of the current log
    , reg  = (options.matcher || new RegExp(name + "\\.\\d+$"))

  fs.readdir(dir, function(err, files) {
    if(err) return cb(err);
    var toShift = [];

    // get matching files from dir
    for(var i = 0, l = files.length; i < l; i++) {
      if(reg.test(files[i]) === true) { toShift.push(files[i]) }
    }

    // reverse sort files by name
    toShift.sort(function(a, b) { return b > a ? 1 : -1; });

    // increment each files index
    for(var i = 0, l = toShift.length; i < l; i++) {
      var file = toShift[i].split('.');
      // set the new log file index
      file.splice(-1, 1, (l - i));
      fs.renameSync(
        path.join(dir, '/', toShift[i]),
        path.join(dir, '/', file.join('.'))
      );
    }

    cb(null);
  });
}
