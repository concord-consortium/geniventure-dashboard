/* global firebase */
import 'whatwg-fetch';        // fetch polyfill
import fakeOffering from './fake-data/offering.json';
import fakeAuthoring from './fake-data/authoring.json';
import fakeStudentData from './fake-data/student-data.json';
import fakeStudentDataITSV3 from './fake-data/student-data-its-v3.json';

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
  getClassData()
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
      if (window.location.hash.indexOf("itsv3") === -1) {
        updateFakeTimes(fakeStudentData);
        callback({
          authoring: fakeAuthoring,
          studentData: fakeStudentData
        });
      } else {
        updateFakeTimes(fakeStudentDataITSV3);
        callback({
          authoring: fakeAuthoring,
          studentData: fakeStudentDataITSV3
        });
      }
    } else {
      // get authoring data once
      firebase.database().ref(fbAuthoringPath)
        .once('value').then(getSnapshotVal)
        .then((data) => {
          callback({authoring: data});
        })
        .catch(console.log.bind(console));

      // notify callback on all student data changes
      const studentFbData = {};

      if (window.location.hash.indexOf("slow") === -1) {
        students.forEach((s) => {
          studentFbData[s.username] = {
            name: s.name
          };

          // state
          firebase.database().ref(`${fbClassPath}${classId}/${fbStudentPath}${s.user_id}/state`)
            .on('value', (snapshot) => {
              const state = snapshot.val() || {};
              studentFbData[s.username].state = state;
              callback({studentData: studentFbData});
            });

          // stateMeta
          firebase.database().ref(`${fbClassPath}${classId}/${fbStudentPath}${s.user_id}/stateMeta`)
            .on('value', (snapshot) => {
              const stateMeta = snapshot.val() || {};
              studentFbData[s.username].stateMeta = stateMeta;
              callback({studentData: studentFbData});
            });

          if (window.location.hash.indexOf("itsv3") === -1) {
            // itsData/studentModel/conceptsAggregated
            firebase.database().ref(`${fbClassPath}${classId}/${fbStudentPath}${s.user_id}/itsData/studentModel/conceptsAggregated`)
              .on('value', (snapshot) => {
                const conceptsAggregated = snapshot.val() || [];
                studentFbData[s.username].itsData = {
                  studentModel: {
                    conceptsAggregated
                  }
                };
                callback({studentData: studentFbData});
              });
          } else {
            // itsData/studentModel/concepts
            firebase.database().ref(`${fbClassPath}${classId}/${fbStudentPath}${s.user_id}/itsData/studentModel/concepts`)
              .on('value', (snapshot) => {
                const concepts = snapshot.val() || [];
                studentFbData[s.username].itsData = {
                  studentModel: {
                    concepts
                  }
                };
                callback({studentData: studentFbData});
              });
          }
        });
      } else {
        const getStudentData = () => {
          console.log("get data!");
          students.forEach((s) => {
            studentFbData[s.username] = {
              name: s.name
            };

            // state
            firebase.database().ref(`${fbClassPath}${classId}/${fbStudentPath}${s.user_id}/state`)
              .once('value', (snapshot) => {
                const state = snapshot.val() || {};
                studentFbData[s.username].state = state;
                callback({studentData: studentFbData});
              });

            // stateMeta
            firebase.database().ref(`${fbClassPath}${classId}/${fbStudentPath}${s.user_id}/stateMeta`)
              .once('value', (snapshot) => {
                const stateMeta = snapshot.val() || {};
                studentFbData[s.username].stateMeta = stateMeta;
                callback({studentData: studentFbData});
              });


            if (window.location.hash.indexOf("itsv3") === -1) {
              // itsData/studentModel/conceptsAggregated
              firebase.database().ref(`${fbClassPath}${classId}/${fbStudentPath}${s.user_id}/itsData/studentModel/conceptsAggregated`)
                .once('value', (snapshot) => {
                  const conceptsAggregated = snapshot.val() || [];
                  studentFbData[s.username].itsData = {
                    studentModel: {
                      conceptsAggregated
                    }
                  };
                  callback({studentData: studentFbData});
                });
            } else {
              // itsData/studentModel/concepts
              firebase.database().ref(`${fbClassPath}${classId}/${fbStudentPath}${s.user_id}/itsData/studentModel/concepts`)
                .once('value', (snapshot) => {
                  const concepts = snapshot.val() || [];
                  studentFbData[s.username].itsData = {
                    studentModel: {
                      concepts
                    }
                  };
                  callback({studentData: studentFbData});
                });
            }
          });
        };
        setInterval(getStudentData, 30 * 1000);
        getStudentData();
      }
    }
  })
  .catch(console.log.bind(console));
}

