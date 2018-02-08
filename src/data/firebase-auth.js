/* global firebase */
import jwt from 'jsonwebtoken';

export const initFirebase = (urlParams) => {

  const config = {
    apiKey: "AIzaSyCr8UbzmHqWVuOIQrU2_1_CIIwT-GphnYo",
    authDomain: "gvstaging.firebaseapp.com",
    databaseURL: "https://gvstaging.firebaseio.com",
    projectId: "gvstaging",
    storageBucket: "",
    messagingSenderId: "574673678327"
  };

  return new Promise((resolve, reject) => {
    // Initialize Firebase
    firebase.initializeApp(config);

    // communicate with portal for JWT
    // if there is no domain parameter, there is no authentication
    if (!urlParams.domain) {
      reject(Error("Not authenticated via portal"));
    } else {
      // send request to portal via domain url parameter
      // for example, https://learn.staging.concord.org/api/v1/jwt/firebase?firebase_app=GVStaging
      const jwtUrl = urlParams.domain + "api/v1/jwt/firebase?firebase_app=" + config.projectId;

      const jwtInit = {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${urlParams.token}`
        }
      };

      fetch(jwtUrl, jwtInit)
        .then((response) => {
          if (!response.ok) {
            // try local session
            const token = sessionStorage.getItem('jwtToken');
            if (!token) {
              reject(Error("Failed to fetch JWT", response.error, response.body));
            } else {
              const authToken = (jwt.decode(token));
              firebase.auth().signInWithCustomToken(token).catch((error) => {
                reject(Error(error));
              });
              sessionStorage.setItem('jwtToken', token);
              resolve(authToken);
            }
          } else {
            let authToken;
            response.json().then((jsonData) => {
              authToken = jwt.decode(jsonData.token);
              firebase.auth().signInWithCustomToken(jsonData.token).catch((error) => {
                reject(Error(error));
              });
              sessionStorage.setItem('jwtToken', jsonData.token);
              resolve(authToken);
            });
          }
        });
    }
  });
}
