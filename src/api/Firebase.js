import firebase from 'react-native-firebase'
import Moment from 'moment';
import * as AsyncStorage from 'react-native';
import BloodRequestHelper from '../helpers/BloodRequestHelper';

class Auth {

    static async registerUser(data) {

        firebase.auth().createUserWithEmailAndPassword(data.email, data.password).then((result) => {

            firebase.firestore().collection('users').doc(result.user.uid).set({
                name: data.name,
                email: data.email,
                phone_number: data.phone_number,
                city: data.city,
                blood_type: data.blood_type,
                sex: data.sex,
                notifRange: 100,
                notify_blood_requests: true,
                notify_next_donation: true,
                notify_only_compatible: false,
                next_donation_reminder: 5,
            });

        });
    }

    static async registerFacebookUser(token) {
        const credential = firebase.auth.FacebookAuthProvider.credential(token.accessToken);
        const firebaseUserCredential = await firebase.auth().signInWithCredential(credential);

        let userData = firebaseUserCredential.user.toJSON();

        await firebase.firestore().collection('users').doc(userData.uid).set({
            name: userData.displayName,
            email: userData.email,
            phone_number: userData.phoneNumber,
            city: '',
            blood_type: '',
            sex: 'male',
            notifRange: 100,
            notify_blood_requests: true,
            notify_next_donation: true,
            notify_only_compatible: false,
            next_donation_reminder: 5,
            facebook: true
        });

        // console.log(JSON.stringify(firebaseUserCredential.user.toJSON()))
    }

    static async getLoggedUser() {

        const loggedUser  = firebase.auth();

        let uid = loggedUser.currentUser.uid;
        let doc = await firebase.firestore().collection('users').doc(uid).get();

        if (doc.exists) {

            return { user: { auth: loggedUser, data: doc.data() } };

        } else {

            return { user: { auth: loggedUser } };
        }
    }

    static async logout() {

        firebase.auth().signOut().then(function() { }, function(error) {
            console.log(error);
        });
    }
}

class Firestore {

    static async getCollection(collection, order, limit, where) {

        if (!order) {
            return await firebase.firestore().collection(collection).where(where[0], where[1], where[2]).limit(limit).get();

        } else if (where){
            return await firebase.firestore().collection(collection).where(where[0], where[1], where[2]).limit(limit).get();
        } else {
            return await firebase.firestore().collection(collection).orderBy(order[0], order[1]).limit(limit).get();
        }
    }

    static async getDoc(collection, doc) {
        return await firebase.firestore().collection(collection).doc(doc).get();
    }

    static async insert(collection, data) {
        return await firebase.firestore().collection(collection).add(data)
    }

    static async update(collection, doc, data) {
        return await firebase.firestore().collection(collection).doc(doc).update(data);
    }

    static async convertToTimestamp(date) {
        return firebase.firestore.Timestamp.fromDate(new Date(date));
    }

    static async deleteOldRequests() {

        await firebase.firestore().collection('requests').get().then((result) => {
            result.forEach((element) => {

                let data = element.data();

                let requestDate = Moment();
                let maxDate = Moment(data.date.toDate());

                let diff = maxDate.diff(requestDate, 'days');

                if (diff < 0) {
                    element.ref.delete();
                }
            });
        })
    }
}

class Notification {

    static async checkPermission() {
        return await firebase.messaging().hasPermission();
    }

    static async requestPermission() {
        return await firebase.messaging().requestPermission();
    }

     static async getToken() {
         return await firebase.messaging().getToken();
    }

    static async sendPush(token, data) {

        let result = await fetch('https://fcm.googleapis.com/fcm/send', {
            method: 'POST',
            headers : {
                'Content-Type':'application/json',
                Authorization : 'key=' + 'AAAAh2oNr3s:APA91bEmUREaa2QosykXy0jBwmrvb8L9aUObJS-wGl_WaMYcP-acf7i4ZokrPfXov28cg8lrfZbND-DMdPoyLSAnnYxW5jl3wglcwdexJQagPd5nFm55GY4zhHECiyqorzDK8wW-U9m7',
            },
            body: JSON.stringify({
                "to": token,
                "notification": {
                    "title": data.title,
                    "body": data.body
                }
            })
        });

        let response = await result.json();
        console.log(response);
    }

    static async sendRequestNotification(data, bloodType) {

        let users = await Firestore.getCollection('users', ['name', 'desc']);

        users.docs.map( (doc) => {

            let userData = doc.data();

            if (userData.notify_blood_requests && userData.fcm_token) {

                if (userData.notify_only_compatible && BloodRequestHelper.compareBloodType(userData.blood_type, bloodType)) {

                    this.sendPush(userData.fcm_token, data);

                } else if (!userData.notify_only_compatible) {

                    this.sendPush(userData.fcm_token, data);
                }
            }
        });
    }

    static scheduleNotification(data, notificationDate, body) {
        if (notificationDate) {

            const channel = new firebase.notifications.Android.Channel(
                "lembrete",
                "Lembretes",
                firebase.notifications.Android.Importance.High
            ).setDescription("Lembrete de Doação");

            firebase.notifications().android.createChannel(channel);

            const notification = new firebase.notifications.Notification()
                .setNotificationId('userDonation')
                .setTitle('Próxima Doação de Sangue')
                .setBody('A partir de hoje você já está apto a realizar uma nova doação de sangue!');

            notification.android.setChannelId("lembrete");

            firebase.notifications().scheduleNotification(notification, {
                fireDate: notificationDate.getTime(),
            })
        }
    }
}

export { Auth, Firestore, Notification }
