export async function getUsername(uid) {
  const options = {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: uid
  };

  const url = '/getUsername';

  const response = await fetch(url, options);
  const username = await response.text();

  return username;
}
