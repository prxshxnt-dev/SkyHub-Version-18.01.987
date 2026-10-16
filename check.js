const fs = require('fs');
console.log('cwd:', process.cwd());
try {
  console.log('/package.json lstat:', fs.lstatSync('/package.json'));
} catch (e) {
  console.log('error /package.json:', e.message);
}
try {
  console.log('./package.json lstat:', fs.lstatSync('./package.json'));
} catch (e) {
  console.log('error ./package.json:', e.message);
}
try {
  if (fs.lstatSync('/package.json').isSymbolicLink()) {
    console.log('/package.json target:', fs.readlinkSync('/package.json'));
  }
} catch (e) {
  console.log('error readlink /package.json:', e.message);
}
