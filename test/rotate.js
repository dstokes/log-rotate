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
  t.plan(2);

  // make first file
  var file = make()
    , files = [file +'.0', file +'.1'];

  // make rotated file
  make(files[0]);

  rotate(file, function(err, r1) {
    for(var i = 0, l = files.length; i < l; i++) {
      t.assert(fs.existsSync(files[i]), 'index '+ [i] +' should exist');
    }
    cleanup(files);
  });
});

test('compresses files', function(t) {
  t.plan(2);

  rotate(make(), { compress: true }, function(err, r1) {
    t.assert(r1.indexOf('gz') !== -1, 'file should be compressed');
    t.assert(fs.existsSync(r1), 'compressed file should exist');
    cleanup(r1);
  });
});
