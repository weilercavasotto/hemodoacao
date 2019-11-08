import { Linking } from 'react-native';

export default class MediaHelper {

    static callNumber (number) {

        Linking.openURL(`tel:${number}`)
    }

    static openUrl (url) {

        Linking.openURL(url)
    }

    static sendEmail (email) {

        Linking.openURL(`mailto:${email}`)
    }
}
