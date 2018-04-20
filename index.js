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

  function remove(name) {
    return function(done) {
      fs.unlink(path.join(dir, '/', name), done);
    }
  }

  function rename(name, target) {
    return function(done) {
      fs.rename(path.join(dir, '/', name), path.join(dir, '/', target), done);
    }
  }

  fs.readdir(dir, function(err, files) {
    if (err) return cb(err);
    var toShift = []
      , jobs, i, l;

    // get matching files from dir
    for (i = 0, l = files.length; i < l; i++) {
      if (reg.test(files[i]) === true) toShift.push(files[i].split('.'))
    }

    // reverse sort files by name
    toShift.sort(function(a, b) {
      var loc = (options.compress ? 2 : 1);
      return +b[b.length - loc] > +a[a.length - loc] ? 1 : -1;
    });

    jobs = toShift.map(function(parts, i) {
      var target = parts.join('.');
      if (count !== null && toShift.length >= count && i <= (toShift.length - count)) {
        return remove(target);
      }

      // increment the log file index
      for (var j = parts.length; j >= 0; j--) {
        if ( isNaN(parts[j]) === false ) { parts[j] = +parts[j] + 1; break; }
      }
      return rename(target, parts.join('.'));
    });

    var rotated = file +'.0';
    series(jobs, function(err) {
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
