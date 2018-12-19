const fs = require('fs');
const path = require('path');
const {ZipFile} = require('yazl');
const streamToPromise = require('stream-to-promise');

/**
 * Bundle an HTML file, and all the images it references, into a ZIP file.
 * @param {String} html - Input HTML.
 * @param {String} file - File path.
 * @param {Object} opts - User options.
 * @param {Object} context - Internal context object.
 * @returns {Promise} Promise that resolves when the ZIP file is written to disk.
 */
module.exports = (html, file, opts, context) => {
  const base = path.dirname(file);

  // Create a ZIP file and point it to a write stream
  const zip = new ZipFile();
  const stream = fs.createWriteStream(context.outputPath);
  zip.outputStream.pipe(stream);

  // Add file for HTML email
  zip.addBuffer(Buffer.from(html), path.basename(file));

  // Add files for each image referenced in HTML
  context.imageSrcs.forEach(src => {
    const filePath = path.resolve(base, src);

    if (path.isAbsolute(src) || src.startsWith('..')) {
      console.log(`Warning for file ${file}`);
      console.log('Scow can\'t bundle files with absolute paths or "../" segments.');
    } else {
      // Skip files that don't exist
      try {
        fs.accessSync(filePath, (fs.constants || fs).F_OK);
        zip.addFile(filePath, src);
      } catch (error) {}
    }
  });

  // Write ZIP file to disk
  zip.end();

  // When the stream is done writing, the Promise will resolve
  return streamToPromise(stream);
};
