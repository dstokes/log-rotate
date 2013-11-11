var fs = require('fs')
  , path = require('path');

module.exports = function(file, options, cb) {
  if(typeof cb === 'undefined') {
    cb = options;
    options = {}
  }

  var dir   = path.dirname(file)
    , name  = path.basename(file)
    , count = options.count ? (options.count - 1) : null
    // regex for matching rotations of the current log
    , reg   = (options.matcher || new RegExp(name + "\\.\\d+$"))

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
      var parts = toShift[i].split('.');
      // set the new log file index
      parts.push( +parts.pop() + 1 );
      // remove log files outside of the `count` limit
      if(typeof count !== "undefined" && l >= count && i <= (l - count)) {
        fs.unlinkSync(path.join(dir, '/', toShift[i]));
      } else {
        fs.renameSync(
          path.join(dir, '/', toShift[i]),
          path.join(dir, '/', parts.join('.'))
        );
      }
    }

    // move the original log file
    fs.renameSync(file, file + '.0');

    cb(null);
  });
}
