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
import { Auth, Firestore } from './../api/Firebase';

import Toast, {DURATION} from 'react-native-easy-toast'

export default class BloodRequestScreen extends React.Component {

    state = {
        inputs: {
            name: '',
            email: '',
            phone_number: '',
            city: '',
            blood_type: '',
            sex: 'male',
            password: '',
            password2: ''
        },
        inputError: {
            name: '',
            email: '',
            phone_number: '',
            city: '',
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
        ],
        mapMarkerData: { }
    };

    componentDidMount () {

    }

    handleSexChange(type) {

       if (type == 'male') {

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

        this.handleInputValue('sex', type);
    }

    handleBloodSelection(key) {

        let newState = this.state.bloodTypes;

        if (!newState[key].selected) {

            newState.map((prop, key) => {
                prop.selected = false;
            });

        }

        newState[key].selected = !newState[key].selected;

        this.handleInputValue('blood_type', newState[key].blood);
    }

    handleInputValue(input, value) {

        let previousState = this.state.inputs;
        previousState[input] = value;

        this.setState({ inputs: previousState });
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

                    <Button buttonStyle={{ borderRadius: 6, backgroundColor: prop.selected ? '#ff4949' : '#dedede' }} key={ key } onPress={ () => { this.handleBloodSelection(prop.key) } } containerStyle={{marginRight: 15}} title={ prop.buttonLabel } titleStyle={{fontWeight: 'bold'}}/>
                );
            }
         })

        return (

            <View style={styles.bloodSelection}>
            { bloodBalls }
            </View>
        );
    }

    async registerUser() {

        let inputs = this.state.inputs;
        let inputsError = this.state.inputError;
        let valid = true;

        for( var key in inputs ) {

            if(inputs[key] === "") {
                valid = false;
            }
        }

        for( var key in inputsError ) {

            if(inputsError[key] !== "") {
                valid = false;
            }
        }

        if (valid) {

            await Auth.registerUser(inputs);

        } else {

            this.refs.toast.show('Erro ao cadastrar usuário, preencha os dados corretamente!', 8000)
        }
    }

    validateInput(field) {

        let oldState = this.state.inputError;

        if (this.state.inputs[field] === '') {

            oldState[field] = 'Preencha o campo corretamente!';

        } else{

            oldState[field] = '';
        }

        if (field === 'password' || field === 'password2') {
            if (this.state.inputs['password'] !== this.state.inputs['password2']) {
                oldState['password'] = 'As senhas são diferentes!';
                oldState['password2'] = 'As senhas são diferentes!';
            } else if (this.state.inputs['password'] === this.state.inputs['password2'] && this.state.inputs['password'].length < 6 ) {
                oldState['password'] = 'A senha deve conter no mínimo seis caracteres!';
                oldState['password2'] = 'A senha deve conter no mínimo seis caracteres!';
            } else if (this.state.inputs['password'] === this.state.inputs['password2']) {
                oldState['password'] = '';
                oldState['password2'] = '';
            }
        }

        this.setState({ inputError: oldState });
    }

    render() {
        return (
            <View style={styles.mainContainer}>
                <Header backScreen={'Login'} navigator={ this.props.navigation } title={'NOVO USUÁRIO'}/>
                <Card containerStyle={styles.cardContainer}>
                    <ScrollView>
                        <FieldSet title={'Preencha os dados'}/>

                        <TextField onBlur={ () => { this.validateInput('name') } } error={this.state.inputError.name} onChangeText={ (value) => this.handleInputValue('name', value) } label={'Nome'} tintColor='#ff4949' lineWidth={1}/>
                        <TextField onBlur={ () => { this.validateInput('email') } } error={this.state.inputError.email} onChangeText={ (value) => this.handleInputValue('email', value) } label={'E-mail'} tintColor='#ff4949' lineWidth={1} autoCapitalize = 'none'/>
                        <TextField onBlur={ () => { this.validateInput('password') } } error={this.state.inputError.password} onChangeText={ (value) => this.handleInputValue('password', value) } label={'Senha'} tintColor='#ff4949' lineWidth={1} autoCapitalize = 'none' secureTextEntry={true}/>
                        <TextField onBlur={ () => { this.validateInput('password2') } } error={this.state.inputError.password2} onChangeText={ (value) => this.handleInputValue('password2', value) } label={'Confirme a sua senha'} tintColor='#ff4949' lineWidth={1} autoCapitalize = 'none' secureTextEntry={true}/>
                        <TextField onBlur={ () => { this.validateInput('city') } } error={this.state.inputError.city} onChangeText={ (value) => this.handleInputValue('city', value) } label={'Cidade'} tintColor='#ff4949' lineWidth={1} />
                        <TextField onBlur={ () => { this.validateInput('phone_number') } } error={this.state.inputError.phone_number} onChangeText={ (value) => this.handleInputValue('phone_number', value) } label={'Telefone'} tintColor='#ff4949' lineWidth={1} keyboardType='numeric'/>

                        <View style={styles.divider}/>
                        <Text style={styles.label}> Sexo </Text>
                        <View style={{flexDirection: 'row'}}>
                            <CheckBox containerStyle={{width: 100, paddingHorizontal: 0, backgroundColor: '#FFF', borderColor: '#FFF'}} checkedColor={'#ff4949'} uncheckedColor={'grey'} checkedIcon='dot-circle-o' uncheckedIcon='circle-o' onPress={ () => { this.handleSexChange('male') }} checked={this.state.genreCheckbox.male} title={'Masculino'}/>
                            <CheckBox containerStyle={{width: 90, paddingHorizontal: 0, backgroundColor: '#FFF', borderColor: '#FFF'}} checkedColor={'#ff4949'} uncheckedColor={'grey'} checkedIcon='dot-circle-o' uncheckedIcon='circle-o' onPress={ () => { this.handleSexChange('female') }} checked={this.state.genreCheckbox.female} title={'Feminino'}/>
                        </View>

                        <FieldSet title={'Tipo Sanguíneo'}/>
                        <View style={styles.divider}/>
                        <Text style={styles.label}> Selecione o seu Tipo Sanguíneo </Text>

                        { this.renderBloodTypeSelection() }

                        <View style={styles.divider}/>
                        <Button onPress={() => { this.registerUser() } } iconRight icon={<Icon style={{marginLeft: '5%'}} solid color={'white'} name={'user'} size={17} />} raised={true} titleStyle={{fontSize: 18, fontWeight: 'bold'}} buttonStyle={{ backgroundColor: '#ff4949'}} title={'REGISTRAR'}/>

                        <Toast ref="toast"
                               style={{backgroundColor:'red'}}
                               position='bottom'
                               positionValue={180}
                               fadeInDuration={0}
                               fadeOutDuration={1000}
                               opacity={0.8}
                        />

                    </ScrollView>
                </Card>
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
        height: '89%'
    },
});
