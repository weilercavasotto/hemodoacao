import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image
} from 'react-native';

import { Button, Card, CheckBox, Slider, Overlay } from 'react-native-elements';
import { TextField } from 'react-native-material-textfield';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Moment from 'moment';
import firebase from 'react-native-firebase'

import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Geolocation from '@react-native-community/geolocation';

import Header from '../components/Header';
import FieldSet from '../components/FieldSet';
import TextArea from '../components/TextArea';
import Label from '../components/Label';
import { ScrollView } from 'react-native-gesture-handler';
import Toast from 'react-native-easy-toast';

import { Auth, Firestore, Notification } from './../api/Firebase';

export default class BloodRequestScreen extends React.Component {

    state = {
        vicinity: '',
        name: '',
        inputs: {
            user_name: '',
            user_email: '',
            user_phone: '',

            pacient_name: '',
            donate_reason: '',
            pacient_sex: 'male',

            requested_blood_type: '',
            daysToDonate: '1',
            hemocentro: '',
            address: '',
            geometry_location: '',
            obs: ''
        },
        inputError: {
            user_name: '',
            user_email: '',
            user_phone: '',

            pacient_name: '',
            donate_reason: '',
            pacient_sex: '',

            hemocentro: '',
            address: '',
        },
        genreCheckbox: {
            male: true,
            female: false,
            none: false,
        },
        daysToGo: 1,
        showMapModal: false,
        bloodTypes: [
            { key: 0, blood: 'A+', selected: false },
            { key: 1, blood: 'A-', selected: false },
            { key: 2, blood: 'B+', selected: false },
            { key: 3, blood: 'B-', selected: false },
            { key: 4, blood: 'AB+', selected: false },
            { key: 5, blood: 'AB-', selected: false },
            { key: 6, blood: 'O+', selected: false },
            { key: 7, blood: 'O-', selected: false },
            { key: 8, buttonLabel: 'Qualquer Tipo', blood: 'any', selected: false },
            // { key: 9, buttonLabel: 'Não Sei', blood: 'dont_know', selected: false },
        ],
        mapMarkerData: { }
    };

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
                    region: region
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

    componentDidMount () {

        this.getCurrentLocation();
    }

    handleSexChange(type) {

        if (type == 'none') {

            this.setState({
                genreCheckbox: {
                  male: false,
                  female: false,
                  none: true
                }
              });

        } else if (type == 'male') {

            this.setState({
                genreCheckbox: {
                  male: true,
                  female: false,
                  none: false
                }
              });

        } else {

            this.setState({
                genreCheckbox: {
                  male: false,
                  female: true,
                  none: false
                }
              });
        }

        this.handleInputValue('pacient_sex', type);
    }

    handleDaysChange(value) {

        this.handleInputValue('daysToDonate', value);

        this.setState({ daysToGo: value });
    }

    handleBloodSelection(key) {

        let newState = this.state.bloodTypes;

        if ((key == 8 || key == 9) && !newState[key].selected) {

            newState.map((prop, key) => {
                prop.selected = false;
            });

        } else if (key <= 7) {

            newState.map((prop, key) => {
                prop.selected = false;
            });
        }

        newState[key].selected = !newState[key].selected;

        this.handleInputValue('requested_blood_type', newState[key].blood);
    }

    handleInputValue(input, value) {

        let previousState = this.state;
        previousState.inputs[input] = value;

        if (input === 'geometry_location') {
            previousState.region = {
                latitude: parseFloat(value.split(',')[0]),
                longitude: parseFloat(value.split(',')[1]),
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421
            }
        }

        this.setState({ previousState });
    }

    renderBloodTypeSelection() {

        let bloodBalls = this.state.bloodTypes.map((prop, key) => {

            if (prop.key <= 7) {

                return (
                    <TouchableOpacity key={key} onPress={ () => { this.handleBloodSelection(prop.key) } }>
                        <View style={{  width: 60,
                                        height: 60,
                                        borderRadius: 60 / 2,
                                        backgroundColor: prop.selected ? '#ff4949' : '#dedede',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginRight: 15,
                                        marginBottom: 10,}}
                            >
                            <Text style={styles.bloodTypeSelectionText}> { prop.blood } </Text>
                        </View>
                    </TouchableOpacity>
                );

            } else {

                return (

                    <Button buttonStyle={{ width: 270, borderRadius: 6, backgroundColor: prop.selected ? '#ff4949' : '#dedede' }} key={ key } onPress={ () => { this.handleBloodSelection(prop.key) } } containerStyle={{marginRight: 15}} title={ prop.buttonLabel } titleStyle={{fontWeight: 'bold'}}/>
                );
            }
         })

        return (

            <View style={styles.bloodSelection}>
            { bloodBalls }
            </View>
        );
    }

    locationMapModal() {

        this.setState({ showMapModal: !this.state.showMapModal });
        console.log(this.state.inputs.geometry_location);
    }

    async insertBloodRequest() {

        let data = this.state.inputs;
        data.date = firebase.firestore.Timestamp.now();

        let valid = true;

        let inputsError = this.state.inputError;
        let inputs = this.state.inputs;

        for( let key in inputsError ) {
            if(inputsError[key] !== "") {
                valid = false;
            }
        }

        for( let key in inputs ) {
            if((key !== 'geometry_location' && key !== 'obs') && inputs[key] === "") {
                valid = false;
            }
        }

        if (valid) {

            await firebase.firestore().collection('requests').add(data);
            this.refs.toast.show('Pedido de doação registrado com sucesso!', 4000);

            setTimeout(() => {
                this.props.navigation.goBack(null);
            }, 1000)

            let notificationData = {
                title: 'Pedido de Doação',
                body: 'Há um novo pedido de doação do tipo '+data.requested_blood_type+' registrado.\nAbra o aplicativo para visualizar.'
            };

            Notification.sendRequestNotification(notificationData, data.requested_blood_type);

        } else {

            this.refs.toastError.show('Preencha os campos corretamente!', 8000);
        }
    }

    obsCallback = (text) => {

        this.handleInputValue('obs', text)
    };

    validateInput(field) {

        let oldState = this.state.inputError;

        if (this.state.inputs[field] === '') {

            oldState[field] = 'Preencha o campo corretamente!';

        } else{

            oldState[field] = '';
        }

        this.setState({ inputError: oldState });
    }

    render() {
        return (
            <View style={styles.mainContainer}>
                <Header backScreen={'Login'} navigator={ this.props.navigation } title={'SOLICITAR NOVA DOAÇÃO'}/>
                <Card containerStyle={styles.cardContainer}>
                    <ScrollView>
                        <FieldSet title={'Dados do Solicitante'}/>

                        <TextField onBlur={ () => { this.validateInput('user_name') } } error={this.state.inputError.user_name} onChangeText={ (value) => this.handleInputValue('user_name', value) } label={'Nome do Solicitante'} tintColor='#ff4949' lineWidth={1}/>
                        <TextField onBlur={ () => { this.validateInput('user_email') } } error={this.state.inputError.user_email} onChangeText={ (value) => this.handleInputValue('user_email', value) } label={'E-mail do Solicitante'} tintColor='#ff4949' lineWidth={1}/>
                        <TextField onBlur={ () => { this.validateInput('user_phone') } } error={this.state.inputError.user_phone} onChangeText={ (value) => this.handleInputValue('user_phone', value) } label={'Telefone para Contato'} tintColor='#ff4949' lineWidth={1}/>

                        <FieldSet title={'Dados do Paciente'}/>

                        <TextField onBlur={ () => { this.validateInput('pacient_name') } } error={this.state.inputError.pacient_name} onChangeText={ (value) => this.handleInputValue('pacient_name', value) } label={'Nome do Paciente'} tintColor='#ff4949' lineWidth={1}/>
                        <TextField onBlur={ () => { this.validateInput('donate_reason') } } error={this.state.inputError.donate_reason} onChangeText={ (value) => this.handleInputValue('donate_reason', value) } label={'Motivo da Doação'} tintColor='#ff4949' lineWidth={1}/>

                        <View style={styles.divider}/>
                        <Text style={styles.label}> Sexo </Text>
                        <View style={{flexDirection: 'row'}}>
                            <CheckBox containerStyle={{width: 100, paddingHorizontal: 0, backgroundColor: '#FFF', borderColor: '#FFF'}} checkedColor={'#ff4949'} uncheckedColor={'grey'} checkedIcon='dot-circle-o' uncheckedIcon='circle-o' onPress={ () => { this.handleSexChange('male') }} checked={this.state.genreCheckbox.male} title={'Masculino'}/>
                            <CheckBox containerStyle={{width: 90, paddingHorizontal: 0, backgroundColor: '#FFF', borderColor: '#FFF'}} checkedColor={'#ff4949'} uncheckedColor={'grey'} checkedIcon='dot-circle-o' uncheckedIcon='circle-o' onPress={ () => { this.handleSexChange('female') }} checked={this.state.genreCheckbox.female} title={'Feminino'}/>
                        </View>

                        <FieldSet title={'Dados da Solicitação'}/>
                        <View style={styles.divider}/>
                        <Text style={styles.label}> Selecione o Tipo Sanguíneo </Text>

                        { this.renderBloodTypeSelection() }

                        <View style={styles.divider}/>
                        <Text style={styles.label}> Dias para Doar </Text>
                        <View style={{flexDirection: 'row'}}>
                            <Slider step={1} style={{width: '80%'}} thumbTintColor={'#ff4949'} minimumTrackTintColor={'#ff4949'} minimumValue={ 1 } maximumValue={ 30 } value= { this.state.daysToGo } onValueChange={ (value) => { this.handleDaysChange(value) } }/>
                            <Text style={styles.daysText}> { this.state.daysToGo } { this.state.daysToGo && this.state.daysToGo > 1 ?  'dias' : 'dia' } </Text>
                        </View>

                        <FieldSet title={'Local para Doação'}/>
                        <TextField value={this.state.inputs.hemocentro} onBlur={ () => { this.validateInput('hemocentro') } } error={this.state.inputError.hemocentro} onChangeText={ (value) => this.handleInputValue('hemocentro', value) } label={'Hemocentro'} tintColor='#ff4949' lineWidth={1}/>
                        <TextField value={this.state.inputs.address} onBlur={ () => { this.validateInput('address') } } error={this.state.inputError.address} onChangeText={ (value) => this.handleInputValue('address', value) } label={'Endereço'} tintColor='#ff4949' lineWidth={1}/>

                        <View style={styles.divider}/>
                        <Button onPress={() => { this.locationMapModal() } } iconRight icon={<Icon style={{marginLeft: '5%'}} alt color={'white'} name={'map-marker-alt'} size={17} />} raised={true} titleStyle={{fontSize: 18, fontWeight: 'bold'}} buttonStyle={{ backgroundColor: '#ff4949'}} title={'LOCALIZAR NO MAPA'}/>

                        <Overlay overlayStyle={{ padding: 0, margin: 0, width: '95%' }} isVisible={ this.state.showMapModal }>

                            <MapView
                                loadingEnabled={ true }
                                provider={PROVIDER_GOOGLE}
                                style={{flex: 1}}
                                showsUserLocation={true}
                                followsUserLocation={ true }
                                zoomControlEnabled={true}
                                region={ (this.state.region) }
                                onRegionChangeComplete={ (region) => { this.handleInputValue('geometry_location', region.latitude + ',' + region.longitude) } }
                                pitchEnabled={true}
                                ref = {(mapView) => { _mapView = mapView; }}>
                            </MapView>

                            <GooglePlacesAutocomplete
                                placeholder='Procure uma localização...'
                                minLength={2}
                                autoFocus={false}
                                returnKeyType={'default'}
                                fetchDetails={true}
                                nearbyPlacesAPI='GooglePlacesSearch'
                                styles={ googleAutoCompleteStyle }
                                query= {{ key: 'AIzaSyAHFNbd3p3IJiyofotBju__XMEJdfGzZiE', language: 'pt-BR' }}
                                onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
                                    _mapView.animateToRegion({
                                        latitude: details.geometry.location.lat,
                                        longitude: details.geometry.location.lng,
                                        latitudeDelta: 0.0122,
                                        longitudeDelta: 0.0121
                                    }, 1000)

                                    let geometry_location = details.geometry.location.lat + ',' + details.geometry.location.lng;

                                    if (details.vicinity) {
                                        this.setState({ vicinity: details.vicinity });
                                        this.handleInputValue('address', details.vicinity);
                                    }

                                    if (details.name) {
                                        this.setState({ name: details.name });
                                        this.handleInputValue('hemocentro', details.name);
                                    }

                                    this.handleInputValue('geometry_location', geometry_location);
                                    this.setState({ mapMarkerData: { data: data, details: details } });
                                }}
                            />

                            <View style={{ left: '46%', position: 'absolute', top: '42%' }}>
                                <Image style={{}} source={ require('./../assets/images/marker.png') } />
                            </View>

                            <Button onPress={() => { this.locationMapModal() } } iconRight icon={<Icon style={{marginLeft: '5%'}} solid color={'white'} name={'map-marker-alt'} size={17} />} raised={true} titleStyle={{fontSize: 18, fontWeight: 'bold'}} buttonStyle={{ backgroundColor: '#ff4949'}} title={'CONFIRMAR'}/>

                        </Overlay>


                        <View style={styles.divider}/>
                        <Label title={ 'Observação' } tooltip={ true } tooltipText={ 'Adicione alguma informação que possa ser relevante para o doador.' }/>
                        <TextArea callback={this.obsCallback} placeholder= { 'Deixe alguma informação importante...' }/>

                        <Button onPress={() => { this.insertBloodRequest() } } iconRight icon={<Icon style={{marginLeft: '5%'}} solid color={'white'} name={'tint'} size={17} />} raised={true} titleStyle={{fontSize: 18, fontWeight: 'bold'}} buttonStyle={{ backgroundColor: '#ff4949'}} title={'REGISTRAR PEDIDO'}/>

                    </ScrollView>
                </Card>

                <Toast ref="toast"
                       style={{backgroundColor:'green'}}
                       position='bottom'
                       positionValue={180}
                       fadeInDuration={1000}
                       fadeOutDuration={1000}
                       opacity={0.8}
                />
                <Toast ref="toastError"
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
        backgroundColor: '#ededed',
    },
    divider: {
        marginTop: '8%',
    },
    bloodSelection: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: '3%',
        padding: 10,
        width: 350,
        alignItems: 'center',
        justifyContent: 'center'
    },
    bloodTypeSelectionText: {
        color: 'white',
        fontSize: 25,
        fontWeight: 'bold'
    },
    daysText: {
        color: 'grey',
        paddingTop: '3%',
        paddingLeft: 15
    },
    cardContainer: {
        marginHorizontal: 8,
        height: '83%'
    },
});

const googleAutoCompleteStyle = StyleSheet.create({
    container: {
        position: 'absolute',
        width: '100%',
        top: 40
    },
    textInputContainer: {
        backgroundColor: 'rgba(0,0,0,0)',
        borderTopWidth: 0,
        borderBottomWidth:0,
        paddingHorizontal: 10,
    },
    textInput: {
        marginLeft: 0,
        marginRight: 0,
        height: 38,
        color: '#5d5d5d',
        fontSize: 16
    },
    predefinedPlacesDescription: {
        color: '#1faadb'
    },
    row: {
        backgroundColor: 'white'
    }
})
