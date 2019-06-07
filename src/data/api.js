/* global firebase */
import 'whatwg-fetch';        // fetch polyfill
import fakeOffering from './fake-data/offering.json';
import fakeAuthoring from './fake-data/authoring.json';
import fakeStudentDataITSV3 from './fake-data/student-data-its-v3.json';

const urlParams = (() => {
  const query = window.location.search.substring(1);
  const rawVars = query.split('&');
  const params = {};
  rawVars.forEach((v) => {
    const [name, value] = v.split('=');
    params[name] = value ? decodeURIComponent(value) : "";
  });
  return params;
})();

// Report URL and auth tokens are provided as an URL parameters.
const OFFERING_URL = urlParams.offering;
const AUTH_HEADER = `Bearer ${urlParams.token}`;
const USE_FAKE_DATA = urlParams.fake != null;

const fbAuthoringPath = '/1/authoring/application';
const fbUserStatePath = '/1/userState';

if (!USE_FAKE_DATA) {
  const fbStagingConfig = {
    apiKey: "AIzaSyCr8UbzmHqWVuOIQrU2_1_CIIwT-GphnYo",
    authDomain: "gvstaging.firebaseapp.com",
    databaseURL: "https://gvstaging.firebaseio.com",
    storageBucket: ''
  };
  const fbProductionConfig = {
    apiKey: 'AIzaSyCQyZqErr-WsvaZzATcmOgxxv1wcrNQXIo',
    authDomain: 'gvdemo-6f015.firebaseapp.com',
    databaseURL: 'https://gvdemo-6f015.firebaseio.com',
    storageBucket: ''
  };
  const fbConfig = urlParams.db === 'staging' ? fbStagingConfig : fbProductionConfig;
  firebase.initializeApp(fbConfig);
}

const encodeFirebasePathComponent = (path) => {
  return encodeURIComponent(path).replace(/\./g, "%2E");
};

const extractDomainFromClassInfoUrl = (classInfoUrl) => {
  // extract domain into match[1], class id into match[2]
  const match = /(.*)\/api\/v1\/classes\/(.*)/.exec(classInfoUrl);
  return match && match[1];
};

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
    // const classId = classData.clazz_id;
    const classInfoUrl = classData.clazz_info_url;
    const classDomain = extractDomainFromClassInfoUrl(classInfoUrl);
    const students = classData.students;

    // send back the class name as soon as we have it
    callback({
      className
    });

    // then query Firebase for the student and authoring data
    if (USE_FAKE_DATA) {
      updateFakeTimes(fakeStudentDataITSV3);
      callback({
        authoring: fakeAuthoring,
        studentData: fakeStudentDataITSV3
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
      const userStateRef = firebase.database().ref(fbUserStatePath);
      const classRef = userStateRef.child(encodeFirebasePathComponent(classInfoUrl));
      const studentFbData = {};

      if (window.location.hash.indexOf("slow") === -1) {
        students && students.forEach((s) => {
          studentFbData[s.username] = {
            name: s.name,
            firstName: s.first_name,
            lastName: s.last_name
          };

          // assume students are in same domain as class
          const studentPath = encodeFirebasePathComponent(`${classDomain}/${s.user_id}`);
          const studentUserRef = classRef.child(studentPath);

          // state
          studentUserRef.child("state")
            .on('value', (snapshot) => {
              const state = snapshot.val() || {};
              studentFbData[s.username].state = state;
              callback({studentData: studentFbData});
            });

          // stateMeta
          studentUserRef.child("stateMeta")
            .on('value', (snapshot) => {
              const stateMeta = snapshot.val() || {};
              studentFbData[s.username].stateMeta = stateMeta;
              callback({studentData: studentFbData});
            });

          // itsData/studentModel/concepts
          studentUserRef.child("itsData/studentModel/concepts")
            .on('value', (snapshot) => {
              const concepts = snapshot.val() || [];
              studentFbData[s.username].itsData = {
                studentModel: {
                  concepts
                }
              };
              callback({studentData: studentFbData});
            });
        });
      } else {
        const getStudentData = () => {
          console.log("get data!");
          students && students.forEach((s) => {
            studentFbData[s.username] = {
              name: s.name,
              firstName: s.first_name,
              lastName: s.last_name
            };

          const studentPath = encodeFirebasePathComponent(`${classDomain}/${s.user_id}`);
          const studentUserRef = classRef.child(studentPath);

            // state
            studentUserRef.child("state")
              .once('value', (snapshot) => {
                const state = snapshot.val() || {};
                studentFbData[s.username].state = state;
                callback({studentData: studentFbData});
              });

            // stateMeta
            studentUserRef.child("stateMeta")
              .once('value', (snapshot) => {
                const stateMeta = snapshot.val() || {};
                studentFbData[s.username].stateMeta = stateMeta;
                callback({studentData: studentFbData});
              });

            // itsData/studentModel/concepts
            studentUserRef.child("itsData/studentModel/concepts")
              .once('value', (snapshot) => {
                const concepts = snapshot.val() || [];
                studentFbData[s.username].itsData = {
                  studentModel: {
                    concepts
                  }
                };
                callback({studentData: studentFbData});
              });
          });
        };
        setInterval(getStudentData, 30 * 1000);
        getStudentData();
      }
    }
  })
  .catch(console.log.bind(console));
}

