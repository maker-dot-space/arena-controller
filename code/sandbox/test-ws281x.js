var PythonShell = require('python-shell');

//you can use error handling to see if there are any errors
PythonShell.run('python/test.py', null, function (err) {
    if (err) throw err;
    console.log('finished');
  });