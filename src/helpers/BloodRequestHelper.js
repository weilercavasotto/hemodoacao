export default class BloodRequestHelper {

    static handleBloodType (type) {

        if (type != 'dont_know' && type != 'any') {
            return type;
        } else {
            return type == 'dont_know' ? '?' : 'Q/';
        }
    }

    static compareBloodType(myType, askedType ) {

        if (myType && askedType) {

            if (myType == 'A+' && (askedType == 'A+' || askedType == 'AB+')) {
                return true;

            } else if (myType == 'A-' && (askedType == 'A+' || askedType == 'A-' || askedType == 'AB+' || askedType == 'AB-')) {
                return true;

            } else if (myType == 'B+' && (askedType == 'B+' || askedType == 'AB+')) {
                return true;

            }  else if (myType == 'B-' && (askedType == 'B+' || askedType == 'AB+' || askedType == 'AB-')) {
                return true;

            }   else if (myType == 'AB+' && (askedType == 'AB+')) {
                return true;

            }   else if (myType == 'AB-' && (askedType == 'AB+' || askedType == 'AB-')) {
                return true;

            }   else if (myType == 'A+' && (askedType == 'B+' || askedType == 'AB+' || askedType == 'O+')) {
                return true;

            } else if (myType == 'O-' || (askedType == 'any' || askedType == 'dont_know')) {
                return true;
            }
        }
    }
}
