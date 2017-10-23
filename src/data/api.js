/* global firebase */
import 'whatwg-fetch';        // fetch polyfill
import fakeOffering from './fake-data/offering.json';
import fakeAuthoring from './fake-data/authoring.json';
import fakeStudentData from './fake-data/student-data.json';

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
const USE_FAKE_DATA = urlParams.fake;

const fbAuthoringPath = '/1/authoring/application';
const fbClassPath = '/1/userState/https%3A%2F%2Flearn%2Econcord%2Eorg%2Fapi%2Fv1%2Fclasses%2F';
const fbStudentPath = 'https%3A%2F%2Flearn%2Econcord%2Eorg%2F';

if (!USE_FAKE_DATA) {
  const fbConfig = {
    apiKey: 'AIzaSyCQyZqErr-WsvaZzATcmOgxxv1wcrNQXIo',
    authDomain: 'gvdemo-6f015.firebaseapp.com',
    databaseURL: 'https://gvdemo-6f015.firebaseio.com',
    storageBucket: ''
  };
  firebase.initializeApp(fbConfig);
}

const getSnapshotVal = (snapshot) => snapshot.val();

const getClassData = () => {
  if (USE_FAKE_DATA) {
    return Promise.resolve(fakeOffering);
  }
  return fetch(OFFERING_URL, {headers: {Authorization: AUTH_HEADER}})
    .then((res) => res.json());
};

const updateFakeTimes = (studentData) => {
  Object.keys(studentData).forEach(studentId => {
    if (studentData[studentId].stateMeta && studentData[studentId].stateMeta.lastActionTime) {
      const rand = Math.random();
      const now = Date.now();
      if (rand < 0.75) {
        studentData[studentId].stateMeta.lastActionTime = now;
      } else if (rand < 0.82) {
        studentData[studentId].stateMeta.lastActionTime = now - (1000 * 60 * 10);
      } else {
        studentData[studentId].stateMeta.lastActionTime = now - (1000 * 60 * 70);
      }
    }
  });
};

export default function addDataListener(callback) {
  return getClassData()
    .then((classData) => {
      const className = classData.clazz;
      const classId = classData.clazz_id;
      const students = classData.students;

      // send back the class name as soon as we have it
      callback({
        className
      });

      // then query Firebase for the student and authoring data
      if (USE_FAKE_DATA) {
        updateFakeTimes(fakeStudentData);
        callback({
          authoring: fakeAuthoring,
          studentData: fakeStudentData
        });
      } else {
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
              const stateMeta = data ? data.stateMeta : {};
              const itsData = data ? data.itsData : {};
              studentFbData[s.username] = {
                name: s.name,
                state,
                stateMeta,
                itsData
              };
            });
            callback({studentData: studentFbData});
          });
      }
    })
    .catch(console.log.bind(console));
}

