var fs = require('fs')
  , zlib = require('zlib')
  , path = require('path');

function series(jobs, cb) {
  (function next(err) {
    if (err) return cb(err);
    var job = jobs.shift();
    job ? job(next) : cb(null);
  })();
}

function zip(file, cb) {
  fs.createReadStream(file)
    .pipe( zlib.createGzip() )
    .pipe( fs.createWriteStream(file +'.gz') )
    .on('finish', function() {
      fs.unlink(file, function(err){
        cb(err, file +'.gz');
      });
    });
}

module.exports = function(file, options, cb) {
  if (typeof cb === 'undefined') {
    cb = options;
    options = {}
  }

  var dir   = path.dirname(file)
    , name  = path.basename(file)
    , count = options.count ? (options.count - 1) : null
    // regex for matching rotations of the current log
    , reg   = (options.matcher || new RegExp(name + "\\.\\d+\\.?"))

  fs.readdir(dir, function(err, files) {
    if (err) return cb(err);
    var toShift = []
      , i, l;

    // get matching files from dir
    for (i = 0, l = files.length; i < l; i++) {
      if (reg.test(files[i]) === true) { toShift.push(files[i]) }
    }

    // reverse sort files by name
    toShift.sort(function(a, b) { return b > a ? 1 : -1; });

    var jobs = [];

    // increment each files index
    for (i = 0, l = toShift.length; i < l; i++) {
      var curr = toShift[i];
      // remove log files outside of the `count` limit
      if (count !== null && l >= count && i <= (l - count)) {
        jobs.push(function(done) {
          fs.unlink(path.join(dir, '/', curr), done);
        });
      } else {
        var parts = toShift[i].split('.');
        // increment the log file index
        for (var j = parts.length; j >= 0; j--) {
          if ( isNaN(parts[j]) === false ) {
            parts[j] = +parts[j] + 1; break;
          }
        }
        // move the file to the new index
        jobs.push(function(done) {
          fs.rename(
            path.join(dir, '/', curr),
            path.join(dir, '/', parts.join('.')),
            done
          );
        });
      }
    }

    series(jobs, function(err) {
      // move the original log file
      var rotated = file + '.0';
      fs.rename(file, rotated, function(err) {
        // compress the newly rotated file
        if (options.compress === true) {
          zip(rotated, cb);
        } else {
          cb(null, rotated);
        }
      });
    });
  });
}
