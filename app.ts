import fs from 'fs';


const name = fs.readFileSync('name.txt', 'utf-8');
console.log(name);

fs.unlink('name.txt', (err) => {
    if (err) throw err;

    console.log('file deleted');
});
 