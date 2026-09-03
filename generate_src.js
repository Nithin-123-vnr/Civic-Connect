const fs = require('fs');
const path = require('path');

const root = __dirname;
const files = {};

// We can read all the src content from the prompt, but since I am in a Node script, I have to inject it. I'll split it into multiple files.
// Let's create an array of objects to map out all files.
