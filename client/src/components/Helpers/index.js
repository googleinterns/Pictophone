export async function getUsername(uid) {
  const options = {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: uid
  };

  const url = '/api/getUsername';

  const response = await fetch(url, options);
  const username = await response.text();

  return username;
}

/*
 * Inspects file header for its true MIME type.
 * From https://stackoverflow.com/a/29672957
 *
 * @param blob file to be inspected
 * @return Promise to get file extension for image files, or unknown if other
 */
export function getMIMEType(blob) {
    var fileReader = new FileReader();

    return new Promise((resolve, reject) => {

      fileReader.onerror = () => {
        fileReader.abort();
        reject(new DOMException("Problem parsing input file."));
      };

      fileReader.onloadend = function(e) {
        var arr = (new Uint8Array(e.target.result)).subarray(0, 4);
        var header = "";
        for(var i = 0; i < arr.length; i++) {
          header += arr[i].toString(16);
        }

        // Check file signature against accepted image types
        var type = "";
        switch (header) {
          case "89504e47":
              type = "png";
              break;
          case "47494638":
              type = "gif";
              break;
          case "ffd8ffe0":
          case "ffd8ffe1":
          case "ffd8ffe2":
          case "ffd8ffe3":
          case "ffd8ffe8":
              type = "jpeg";
              break;
          default:
              type = "unknown";
              break;
          }

        resolve(type);
      };
      fileReader.readAsArrayBuffer(blob);
    });

  }

  export async function sendEmail(game, gameId) {
    const gameRef = await game.get();
    const emailType = (gameRef.data().currentPlayerIndex+1 === gameRef.data().players.length) ? 'end' : 'turn';
    fetch('/api/notify', {
      method: 'POST',
      headers: {
        'Accept': 'application/x-www-form-urlencoded, multipart/form-data, text/plain',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `gameID=${gameId}&emailType=${emailType}`,
    }).then((response) => {
      console.log(response.text());
    });
  }
