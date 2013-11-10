log-rotate
======

Rotate a log similar to the way linux logrotate does, appending and updating
`.NUM` indexes as you go.

[![NPM](https://nodei.co/npm/log-rotate.png?downloads=true)](https://nodei.co/npm/log-rotate/)  

Example
=======
``` js
var rotator = require('log-rotate');
  
// move a log file while incrementing existing indexed / rotated logs
rotator(logfile, function(err) {
  // logfile.0  
});
```

install
=======

With [npm](http://npmjs.org) do:

```
npm install log-rotate
```
