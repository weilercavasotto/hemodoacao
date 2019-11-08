import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
    ActivityIndicator
} from 'react-native';

import Moment from 'moment';
import Geolocation from '@react-native-community/geolocation';

import {Button, CheckBox, Overlay, SearchBar} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome5';

import Donation from '../components/Donation';
import Header from '../components/Header';

import { Auth, Firestore, Notification } from './../api/Firebase';
import FieldSet from '../components/FieldSet';
import {TextField} from 'react-native-material-textfield';
import firebase from "react-native-firebase";
import Toast from 'react-native-easy-toast';

export default class HomeScreen extends React.Component {

    state = {
        user: { auth: { }, data: { } },
        userLocation: { },
        bloodDonations: { donations: [ ], refreshing: false },
        fetching: true,
        searchValue: '',
        showAddModal: false,
        inputs: {
            hemocentro: '',
            city: '',
        },
        inputError: {
            hemocentro: '',
            city: '',
        }
    };

    async componentDidMount() {

        let user = await Auth.getLoggedUser();
        this.setState(user);

        this.getCurrentLocation();
        this.getDonations();
    }

    validateInput(field) {

        let oldState = this.state.inputError;

        if (this.state.inputs[field] === '') {

            oldState[field] = 'Preencha o campo corretamente!';

        } else{

            oldState[field] = '';
        }

        this.setState({ inputError: oldState });
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

    async getDonations() {

        let userId = this.state.user.auth.currentUser.uid;

        let donations = [];
        let collection = await Firestore.getCollection('donations', ['date', 'desc'], 100, ['user', '==', userId]);

        collection.docs.map( (doc) => {
            donations.push(doc.data());
        });

        donations.sort(function(a,b){
            return new Date(b.date.toDate()) - new Date(a.date.toDate())
        });

        this.setState({ fetching: false, bloodDonations: { donations: donations, refreshing: false } });
    }

    renderRefreshControl() {

        return (

            <RefreshControl
                refreshing={this.state.bloodDonations.refreshing}
                onRefresh={ () => { this.getDonations() }} />
        );
    }

    handleRequestDate(date) {

        let requestDate = Moment(date.toDate());

        return requestDate.format('DD/MM/YYYY');
    }

    renderBloodRequest() {

        return (
            this.state.bloodDonations.donations.map((request, key) => {
                return ( <Donation key={ key } date={ this.handleRequestDate(request.date) } city={ request.city } hemocentro={ request.hemocentro }/> );
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

    searchBar(text) {

        if (text == '') {

            this.setState({ searchValue: '' })
            this.getDonations();

        } else {

            let arrayHolder = this.state.bloodDonations.donations;

            const newData = arrayHolder.filter( (item) => {

                const itemData = item.hemocentro ? item.hemocentro.toUpperCase() : ''.toUpperCase();

                const textData = text.toUpperCase();
                return itemData.indexOf(textData) > -1;
            });

            this.setState({ searchValue: text, bloodDonations: { donations: newData } });

            if (text.length < this.state.searchValue.length) {
                this.setState({ searchValue: '' });
                this.getDonations();
            }
        }
    }

    showAddModal() {

        if (this.state.showAddModal) {

            let valid = true;
            let inputsError = this.state.inputError;
            let inputs = this.state.inputs;

            for( let key in inputsError ) {
                if(inputsError[key] !== "") {
                    valid = false;
                }
            }

            for( let key in inputs ) {
                if(inputs[key] === "") {
                    valid = false;
                }
            }

            if (valid) {

                let data = this.state.inputs;
                data.date = firebase.firestore.Timestamp.fromDate(new Date(Moment().format('YYYY/MM/DD')));
                data.user = this.state.user.auth.currentUser.uid;

                Firestore.insert('donations', data);
                this.refs.toast.show('Doação registrada com sucesso!', 4000);

                let notifDate = Moment();
                let daysToAdd = this.state.user.data.sex === 'male' ? 60 : 90;
                notifDate.add(daysToAdd, 'days');

                Notification.scheduleNotification(data, notifDate.toDate());

                this.getDonations();

                this.setState({ showAddModal: !this.state.showAddModal });

            } else {

                this.refs.errorToast.show('Preencha os campos corretamente!', 4000);
            }
        } else {
            this.setState({ showAddModal: !this.state.showAddModal });
        }
    }

    handleInputValue(input, value) {

        let previousState = this.state.inputs;
        previousState[input] = value;

        this.setState({ inputs: previousState });
    }

    render() {

        return (
            <View style={styles.mainContainer}>
                <Header backScreen={'Profile'} navigator={ this.props.navigation } title={'MINHAS DOAÇÕES'}/>
                <SearchBar onClear={ () => { this.searchBar('') } } onChangeText={ text => this.searchBar(text) } value={ this.state.searchValue } placeholder={'Digite algo para buscar...'} platform={'ios'}/>
                <Text style={{marginHorizontal: 8, color: 'grey'}}> {'Doações Realizadas'} </Text>

                <ScrollView refreshControl={ this.renderRefreshControl() }>

                    { !this.state.fetching ? this.renderBloodRequest() : this.renderLoadingIndicator() }

                </ScrollView>

                <Overlay isVisible={ this.state.showAddModal } height={ 'auto' } width={'95%'}>
                    <View>
                        <FieldSet title={'Nova Doação'}/>

                        <TextField onBlur={ () => { this.validateInput('hemocentro') } } error={this.state.inputError.hemocentro} onChangeText={ (value) => this.handleInputValue('hemocentro', value) } label={'Hemocentro Doação'} tintColor='#ff4949' lineWidth={1}/>
                        <TextField onBlur={ () => { this.validateInput('city') } } error={this.state.inputError.city} onChangeText={ (value) => this.handleInputValue('city', value) } label={'Cidade'} tintColor='#ff4949' lineWidth={1}/>
                        <TextField value={ Moment().format('DD/MM/YYYY') } onChangeText={ (value) => this.handleInputValue('date', value) } label={'Data'} tintColor='#ff4949' lineWidth={1}/>

                        <View style={styles.divider}/>

                        <Button  iconRight icon={ <Icon size={17} style={{marginLeft: '5%', color: 'white'}} solid alt name={'check'}/> } onPress={() => { this.showAddModal() }} raised={true} titleStyle={{fontSize: 18, fontWeight: 'bold'}} buttonStyle={{ backgroundColor: '#ff4949'}} title={'CONFIRMAR'}/>
                    </View>
                </Overlay>

                <TouchableOpacity
                    onPress={ () => { this.showAddModal() } }
                    style={{
                        alignItems:'center',
                        justifyContent:'center',
                        width:70,
                        position: 'absolute',
                        bottom: 50,
                        right: 10,
                        height:70,
                        backgroundColor:'#fff',
                        borderRadius:100,
                        borderColor: '#ededed',
                        borderWidth: 1
                    }}
                >
                    <Icon name="plus" size={30} color="#ff4949" />
                </TouchableOpacity>
                <Toast ref="toast"
                       style={{backgroundColor:'green'}}
                       position='bottom'
                       positionValue={180}
                       fadeInDuration={1000}
                       fadeOutDuration={1000}
                       opacity={0.8}
                />
                <Toast ref="errorToast"
                       style={{backgroundColor:'red'}}
                       position='bottom'
                       positionValue={180}
                       fadeInDuration={1000}
                       fadeOutDuration={1000}
                       opacity={0.8}
                />
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
