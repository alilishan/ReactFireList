import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
// import "firebase/firestore";

const firebaseConfig = {
	apiKey: "AIzaSyCQfdikcsM0CrLvSluHEXBbZbWDdIIz_kY",
	authDomain: "reactfirelist.firebaseapp.com",
	databaseURL: "https://reactfirelist.firebaseio.com",
	projectId: "reactfirelist",
	storageBucket: "reactfirelist.appspot.com",
	messagingSenderId: "704863863118",
	appId: "1:704863863118:web:9f9fdc0cf5467b4ed85e1f"
};

export const FirebaseApp = firebase.initializeApp(firebaseConfig);
export const FirebaseDB = FirebaseApp.database();