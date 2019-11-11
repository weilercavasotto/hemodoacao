import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    Platform
} from 'react-native';

import Moment from 'moment';
import Geolocation from '@react-native-community/geolocation';

import {Button, CheckBox, Overlay, SearchBar} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome5';

import BloodRequest from '../components/BloodRequest';
import Header from '../components/Header';

import { Auth, Firestore, Notification } from './../api/Firebase';
import firebase from "react-native-firebase";
import {TextField} from 'react-native-material-textfield';

export default class HomeScreen extends React.Component {

    state = {
        user: { auth: { }, data: { } },
        userLocation: { },
        bloodRequests: { requests: [ ], refreshing: false },
        fetching: true,
        searchValue: '',
        showLoginModal: false,
        inputs: {
            bloodTypes: [
                { key: 0, blood: 'A+', selected: false },
                { key: 1, blood: 'A-', selected: false },
                { key: 2, blood: 'B+', selected: false },
                { key: 3, blood: 'B-', selected: false },
                { key: 4, blood: 'AB+', selected: false },
                { key: 5, blood: 'AB-', selected: false },
                { key: 6, blood: 'O+', selected: false },
                { key: 7, blood: 'O-', selected: false },
            ],
            sex: [{ sex: 'male', selected: false }, { sex: 'female', selected: false }]
        },
        inputError: {
            phone_number: '',
            city: ''
        },
    };

    async componentDidMount() {

        let user = await Auth.getLoggedUser();
        this.setState(user);

        await Firestore.deleteOldRequests();

        this.getCurrentLocation();
        this.getRequests();

        if (Platform.OS !== 'ios') {

            let permission = await Notification.checkPermission();

            if (this.state.user.data.facebook && !this.state.user.data.finished_login) {

                let oldState = this.state;
                oldState.showLoginModal = true;
                this.setState(oldState);
            }

            if (!permission) {
                await Notification.requestPermission();
            }

            if (!this.state.user.data.fcm_token && permission) {

                let userData = this.state.user.data;
                userData.fcm_token = await Notification.getToken();

                if (userData.fcm_token) {
                    Firestore.update('users', this.state.user.auth.currentUser.uid, userData);
                }
            }

            firebase.messaging().onTokenRefresh((fcmToken) => {

                let userData = this.state.user.data;
                userData.fcm_token = fcmToken;

                Firestore.update('users', this.state.user.auth.currentUser.uid, userData);
            });
        }
    }

    async getCurrentLocation() {
        Geolocation.getCurrentPosition(
            (position) => {

                let region = {
                    latitude: parseFloat(position.coords.latitude),
                    longitude: parseFloat(position.coords.longitude),
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421
                };

                this.setState({
                    userLocation: region
                });
            },
            error => console.log(error),
            {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 1000
            }
        );
    }

    async getRequests() {

        let requests = [];
        let collection = await Firestore.getCollection('requests', ['date', 'desc']);

        collection.docs.map( (doc) => {
            requests.push(doc.data());
        });

        this.setState({ fetching: false, bloodRequests: { requests: requests, refreshing: false } });
    }

    renderRefreshControl() {

        return (

            <RefreshControl
            refreshing={this.state.bloodRequests.refreshing}
            onRefresh={ () => { this.getRequests() }} />
        );
    }

    handleRequestDate(date) {

        let actualDate = Moment();
        let requestDate = Moment(date.toDate());

        let diff = actualDate.diff(requestDate, 'days');

        if (diff <= 7 && (diff > 0 && diff != 1)) {

            return 'Há ' + diff + ' dias';

        } else if (diff == 0) {

            return 'Hoje às ' + requestDate.format('HH:mm');

        } else if (diff == 1) {

            return 'Ontem às ' + requestDate.format('HH:mm');

        } else {

            return requestDate.format('DD/MM/YYYY HH:mm');
        }
    }

    handleAddressInfo(request, key) {

        if (request.geometry_location && !request.fetchedDistance) {

            let userLocation = this.state.userLocation.latitude + ',' + this.state.userLocation.longitude;

            this.getDistanceInKM( userLocation, request.geometry_location).then(result => {

                let oldState = this.state;
                oldState.bloodRequests.requests[key].distance = result.distance.text;
                oldState.bloodRequests.requests[key].fetchedDistance = true;

                this.setState({ oldState });
            });
        }
    }

    async getDistanceInKM(userLocation, donateLocation) {

        let url = 'https://maps.googleapis.com/maps/api/distancematrix/json?key=AIzaSyAHFNbd3p3IJiyofotBju__XMEJdfGzZiE&origins='+userLocation+'&destinations='+donateLocation+'';

        let response = await fetch(url);
        let json = await response.json();

        return json.rows[0].elements[0];
    }

    renderBloodRequest() {

        if (this.state.bloodRequests.requests.length === 0) {

            return (
                <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 150 }}>
                    <Text>{'Não existem pedidos de doação no momento!'}</Text>
                </View>
            )
        }

        return (
            this.state.bloodRequests.requests.map((request, key) => {

                if (!request.fetchedDistance) {
                    this.handleAddressInfo(request, key);
                }

                return ( <BloodRequest onClick={ () => { this.props.navigation.navigate('DetailedRequest', { request: request }) }} key={ key } date={ this.handleRequestDate(request.date) } address={ (request.distance ? request.address + ' · ' + request.distance : request.address ) } hemocentro={ request.hemocentro } bloodType={ request.requested_blood_type }/> );
            })
        )
    }

    renderLoadingIndicator() {
        return(
            <View style={{ flex: 1, padding: 20 }}>
                <ActivityIndicator/>
            </View>
        )
    }

    validateInput(field) {

        let oldState = this.state.inputError;

        if (this.state.inputs[field] === '' || this.state.inputs[field] === undefined) {

            oldState[field] = 'Preencha o campo corretamente!';

        } else{

            oldState[field] = '';
        }

        this.setState({ inputError: oldState });
    }

    handleInputValue(input, value) {

        let previousState = this.state.inputs;
        previousState[input] = value;

        this.setState({ inputs: previousState });
    }

    handleBloodTypeChange(blood) {

        let oldState = this.state.inputs.bloodTypes;

        oldState.map( (item, key) => {

            oldState[key].selected = false;

            if (oldState[key].blood == blood) {

                oldState[key].selected = true;
            }
        });

        let inputs = this.state.inputs;
        inputs.bloodTypes = oldState;

        this.setState({ inputs: inputs });
        this.handleInputValue('blood_type', blood)
    }

    handleSexTypeChange(sex) {

        let oldState = this.state.inputs.sex;
        oldState.map( (item, key) => {

            oldState[key].selected = false;

            if (oldState[key].sex == sex) {

                oldState[key].selected = true;
            }
        });

        let inputs = this.state.inputs;
        inputs.sex = oldState;

        this.setState({ inputs: inputs });
    }

    searchBar(text) {

        if (text == '') {

            this.setState({ searchValue: '' })
            this.getRequests();

        } else {

            let arrayHolder = this.state.bloodRequests.requests;

            const newData = arrayHolder.filter( (item) => {
                const hemocentro = item.hemocentro ? item.hemocentro.toUpperCase() : ''.toUpperCase();
                const requested_blood_type = item.requested_blood_type ? item.requested_blood_type.toUpperCase() : ''.toUpperCase();
                const address = item.address ? item.address.toUpperCase() : ''.toUpperCase();

                const textData = text.toUpperCase();

                if (hemocentro.indexOf(textData) > -1 || requested_blood_type.indexOf(textData) > -1 || address.indexOf(textData) > -1) {

                    return true;
                }
            });

            this.setState({ searchValue: text, bloodRequests: { requests: newData } });

            if (text.length < this.state.searchValue.length) {
                this.setState({ searchValue: '' });
                this.getRequests();
            }
        }
    }

    updateUserInfo() {

        let valid = true;
        let inputsError = this.state.inputError;

        for( let key in inputsError ) {
            if(inputsError[key] !== "") {
                valid = false;
            }
        }

        if (this.state.inputs.sex[0].selected === false && this.state.inputs.sex[1].selected === false) {
            valid = false;
        }

        if (valid) {

            let data = this.state.user.data;

            this.state.inputs.bloodTypes.map((item, key) => {
                if (item.selected) {
                    data.blood_type = item.blood;
                }
            });

            data.phone_number = this.state.inputs.phone_number;
            data.city = this.state.inputs.city;
            data.sex = this.state.inputs.sex[0].selected === true ? this.state.inputs.sex[0].sex : this.state.inputs.sex[1].sex;
            data.finished_login = true;

            Firestore.update('users', this.state.user.auth.currentUser.uid, data);
            this.setState({ showLoginModal: false });
        }
    }

    render() {

        return (
            <View style={styles.mainContainer}>
            <Header title={'PEDIDOS DE DOAÇÃO'}/>
            <SearchBar onClear={ () => { this.searchBar('') } } onChangeText={ text => this.searchBar(text) } value={ this.state.searchValue } placeholder={'Digite algo para buscar...'} platform={'ios'}/>
            <Text style={{marginHorizontal: 8, color: 'grey'}}> {'Pedidos Recentes'} </Text>

                <ScrollView refreshControl={ this.renderRefreshControl() }>

                    <Overlay overlayStyle={{width: '94%', height: 'auto'}} isVisible={ this.state.showLoginModal }>
                        <View>
                            <Text style={{ fontWeight: 'bold', fontSize: 15, paddingBottom: 12 }}>Finalize o seu Cadastro</Text>

                            <TextField onBlur={ () => { this.validateInput('phone_number') } } error={this.state.inputError.phone_number} onChangeText={ (value) => this.handleInputValue('phone_number', value) } label={'Telefone'} tintColor='#ff4949' lineWidth={1}/>
                            <TextField onBlur={ () => { this.validateInput('city') } } error={this.state.inputError.city} onChangeText={ (value) => this.handleInputValue('city', value) } label={'Cidade'} tintColor='#ff4949' lineWidth={1}/>

                            <View style={styles.divider}/>
                            <Text style={styles.label}> Sexo </Text>
                            <View style={{flexDirection: 'row'}}>
                                <CheckBox containerStyle={{width: 100, paddingHorizontal: 0, backgroundColor: '#FFF', borderColor: '#FFF'}} checkedColor={'#ff4949'} uncheckedColor={'grey'} checkedIcon='dot-circle-o' uncheckedIcon='circle-o' onPress={ () => { this.handleSexTypeChange('male') }} checked={this.state.inputs.sex[0].selected} title={'Masculino'}/>
                                <CheckBox containerStyle={{width: 100, paddingHorizontal: 0, backgroundColor: '#FFF', borderColor: '#FFF'}} checkedColor={'#ff4949'} uncheckedColor={'grey'} checkedIcon='dot-circle-o' uncheckedIcon='circle-o' onPress={ () => { this.handleSexTypeChange('female') }} checked={this.state.inputs.sex[1].selected} title={'Feminino'}/>
                            </View>

                            <View style={styles.divider}/>
                            <Text style={styles.label}> Tipo Sanguíneo </Text>
                            <View style={{flexDirection: 'row'}}>
                                <CheckBox containerStyle={{width: 55, paddingHorizontal: 0, backgroundColor: '#FFF', borderColor: '#FFF'}} checkedColor={'#ff4949'} uncheckedColor={'grey'} checkedIcon='dot-circle-o' uncheckedIcon='circle-o' onPress={ () => { this.handleBloodTypeChange('A+') }} checked={this.state.inputs.bloodTypes[0].selected} title={'A+'}/>
                                <CheckBox containerStyle={{width: 50, paddingHorizontal: 0, backgroundColor: '#FFF', borderColor: '#FFF'}} checkedColor={'#ff4949'} uncheckedColor={'grey'} checkedIcon='dot-circle-o' uncheckedIcon='circle-o' onPress={ () => { this.handleBloodTypeChange('A-') }} checked={this.state.inputs.bloodTypes[1].selected} title={'A-'}/>
                                <CheckBox containerStyle={{width: 55, paddingHorizontal: 0, backgroundColor: '#FFF', borderColor: '#FFF'}} checkedColor={'#ff4949'} uncheckedColor={'grey'} checkedIcon='dot-circle-o' uncheckedIcon='circle-o' onPress={ () => { this.handleBloodTypeChange('B+') }} checked={this.state.inputs.bloodTypes[2].selected} title={'B+'}/>
                                <CheckBox containerStyle={{width: 55, paddingHorizontal: 0, backgroundColor: '#FFF', borderColor: '#FFF'}} checkedColor={'#ff4949'} uncheckedColor={'grey'} checkedIcon='dot-circle-o' uncheckedIcon='circle-o' onPress={ () => { this.handleBloodTypeChange('B-') }} checked={this.state.inputs.bloodTypes[3].selected} title={'B-'}/>
                            </View>
                            <View style={{flexDirection: 'row'}}>
                                <CheckBox containerStyle={{width: 55, paddingHorizontal: 0, backgroundColor: '#FFF', borderColor: '#FFF'}} checkedColor={'#ff4949'} uncheckedColor={'grey'} checkedIcon='dot-circle-o' uncheckedIcon='circle-o' onPress={ () => { this.handleBloodTypeChange('AB+') }} checked={this.state.inputs.bloodTypes[4].selected} title={'AB+'}/>
                                <CheckBox containerStyle={{width: 50, paddingHorizontal: 0, backgroundColor: '#FFF', borderColor: '#FFF'}} checkedColor={'#ff4949'} uncheckedColor={'grey'} checkedIcon='dot-circle-o' uncheckedIcon='circle-o' onPress={ () => { this.handleBloodTypeChange('AB-') }} checked={this.state.inputs.bloodTypes[5].selected} title={'AB-'}/>
                                <CheckBox containerStyle={{width: 55, paddingHorizontal: 0, backgroundColor: '#FFF', borderColor: '#FFF'}} checkedColor={'#ff4949'} uncheckedColor={'grey'} checkedIcon='dot-circle-o' uncheckedIcon='circle-o' onPress={ () => { this.handleBloodTypeChange('O+') }} checked={this.state.inputs.bloodTypes[6].selected} title={'O+'}/>
                                <CheckBox containerStyle={{width: 55, paddingHorizontal: 0, backgroundColor: '#FFF', borderColor: '#FFF'}} checkedColor={'#ff4949'} uncheckedColor={'grey'} checkedIcon='dot-circle-o' uncheckedIcon='circle-o' onPress={ () => { this.handleBloodTypeChange('O-') }} checked={this.state.inputs.bloodTypes[7].selected} title={'O-'}/>
                            </View>

                            <View style={styles.divider}/>

                            <Button onPress={ () => { this.updateUserInfo(); } } buttonStyle={{ justifyContent: 'center', backgroundColor: '#ff4949' }} titleStyle={{ fontWeight: 'bold' }} iconRight icon={ <Icon style={{ marginLeft: 10 }} name={'check'} solid color={'white'} size={20}/> } title={'Salvar'} />
                        </View>
                    </Overlay>

                    { !this.state.fetching ? this.renderBloodRequest() : this.renderLoadingIndicator() }

                </ScrollView>

                <TouchableOpacity
                onPress={ () => { this.props.navigation.navigate('BloodRequest') } }
                style={{
                    alignItems:'center',
                    justifyContent:'center',
                    width:70,
                    position: 'absolute',
                    bottom: 10,
                    right: 10,
                    height:70,
                    backgroundColor:'#fff',
                    borderRadius:100,
                    borderColor: '#ededed',
                    borderWidth: 1
                    }}
                >
                    <Icon name="tint" size={30} color="#ff4949" />
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
        backgroundColor: '#ededed',
    },
    divider: {
        marginTop: '8%',
    },
})
