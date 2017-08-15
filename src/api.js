/*global firebase*/

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

const fbAuthoringPath = '/1/authoring/application';
const fbClassPath = '/1/userState/https%3A%2F%2Flearn%2Econcord%2Eorg%2Fapi%2Fv1%2Fclasses%2F';
const fbStudentPath = 'https%3A%2F%2Flearn%2Econcord%2Eorg%2F';

const fbConfig = {
  apiKey: 'AIzaSyCQyZqErr-WsvaZzATcmOgxxv1wcrNQXIo',
  authDomain: 'gvdemo-6f015.firebaseapp.com',
  databaseURL: 'https://gvdemo-6f015.firebaseio.com',
  storageBucket: ''
};
firebase.initializeApp(fbConfig);

const getSnapshotVal = (snapshot) => snapshot.val();

export default function addDataListener(callback) {
  return fetch(OFFERING_URL, {headers: {Authorization: AUTH_HEADER}})
    .then((res) => res.json())
    .then((classData) => {
      const classId = classData.clazz_id;
      const students = classData.students;

      // get authoring data once
      firebase.database().ref(fbAuthoringPath)
        .once('value').then(getSnapshotVal)
        .then((data) => {
          callback({authoring: data});
        })
        .catch(console.log.bind(console));

      // notify callback on all student data changes
      firebase.database().ref(`${fbClassPath}${classId}`)
        .on('value', (snapshot) => {
          const fbData = snapshot.val();
          const studentFbData = {};
          students.forEach((s) => {
            const data = fbData[`${fbStudentPath}${s.user_id}`];
            const state = data ? data.state : {};
            studentFbData[s.username] = {
              name: s.name,
              state
            };
          });
          callback({studentData: studentFbData});
        });
    })
    .catch(console.log.bind(console));
}

