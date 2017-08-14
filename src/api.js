const urlParams = (() => {
  const query = window.location.search.substring(1);
  const rawVars = query.split('&');
  const params = {};
  rawVars.forEach((v) => {
    const arr = v.split('=');
    const pair = arr.splice(0, 1);
    pair.push(arr.join('='));
    params[pair[0]] = decodeURIComponent(pair[1]);
  });
  return params;
})();

// Report URL and auth tokens are provided as an URL parameters.
const OFFERING_URL = urlParams.offering;
const AUTH_HEADER = `Bearer ${urlParams.token}`;

export default function getData() {
  return fetch(OFFERING_URL, {headers: {Authorization: AUTH_HEADER}})
    .then((res) => res.json())
    .catch(console.log.bind(console));
}

