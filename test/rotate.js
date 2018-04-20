var fs = require('fs')
  , test = require('tape')
  , rotate = require('../');

function make(file) {
  file = (file || __dirname +'/test_'+ (+new Date()) +'.log');
  fs.openSync(file, 'w');
  return file;
}

function cleanup(files) {
  if (! (files instanceof Array)) files = [files];
  for(var i = 0, l = files.length; i < l; i++) { fs.unlinkSync(files[i]); }
}

test('moves rotated file to zero index', function(t) {
  t.plan(2);

  var file = make();
  rotate(file, function(err, rotated) {
    t.equal(rotated, file +'.0', 'rotated file should have 0 index');
    fs.exists(rotated, function(ex) {
      t.assert(ex, 'rotated file should exist');
      cleanup(file +'.0');
    });
  });
});

test('increments previously rotated files', function(t) {
  var file = make()
    , count = 20
    , keep  = 18
    , rotated = 0;
  t.plan(keep-1);

  function done() {
    var name = '', files = [];
    for(var i = 0, l = keep-1; i < l; i++) {
      files.push(name = file +'.'+ i);
      t.assert(fs.existsSync(name), 'index '+ [i] +' should exist');
    }
    cleanup(files);
  }

  (function next() {
    rotate(make(file), { count: keep }, function(err, r) {
      if (err) throw err;
      if (++rotated === count) return done();
      next();
    });
  })();
});

test('increments and compresses rotated files', function(t) {
  var file = make()
    , count = 20
    , keep  = 18
    , rotated = 0;
  t.plan(keep-1);

  function done() {
    var name = '', files = [];
    for(var i = 0, l = keep-1; i < l; i++) {
      files.push(name = file +'.'+ i + '.gz');
      t.assert(fs.existsSync(name), 'index '+ [i] +' should exist');
    }
    cleanup(files);
  }

  (function next() {
    rotate(make(file), { compress: true, count: keep }, function(err, r) {
      if (err) throw err;
      if (++rotated === count) return done();
      next();
    });
  })();
});

