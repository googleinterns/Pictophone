const bucketName = 'pictophone-drawings';

// Imports the Google Cloud client library
const {Storage} = require('@google-cloud/storage');

// Creates a client
const storage = new Storage();

async function generateV4UploadSignedUrl(filename) {
  // These options will allow temporary uploading of the file with outgoing
  // Content-Type: application/octet-stream header.
  const options = {
    version: 'v4',
    action: 'write',
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    contentType: 'application/octet-stream',
  };

  // Get a v4 signed URL for uploading file
  const [url] = await storage
    .bucket(bucketName)
    .file(filename)
    .getSignedUrl(options);

  console.log('Generated PUT signed URL:');
  console.log(url);
  console.log('You can use this URL with any user agent, for example:');
  console.log(
    "curl -X PUT -H 'Content-Type: application/octet-stream' " +
      `--upload-file my-file '${url}'`
  );
}

export default generateV4UploadSignedUrl;
