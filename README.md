log-rotate
======

Rotate a log similar to the way linux logrotate does, appending and updating
`.NUM` indexes as you go.

[![Build Status](https://travis-ci.org/dstokes/log-rotate.png)](https://travis-ci.org/dstokes/log-rotate)  
[![NPM](https://nodei.co/npm/log-rotate.png?downloads=true)](https://nodei.co/npm/log-rotate/)  

Example
=======
``` js
var rotate = require('log-rotate');
  
// move a log file while incrementing existing indexed / rotated logs
rotate('./test.log', function(err) {
  // ls ./ => test.log test.log.0
});
```

options
=======

### count
Limit the number of rotated files to `count`

``` js
var rotate = require('log-rotate');

rotate('./test.log', { count: 3 }, function(err) {
  // ls ./ => test.log test.log.0 test.log.1
});
```

### compress
Compress rotated files with gzip

install
=======

With [npm](http://npmjs.org) do:

```
npm install log-rotate
```
