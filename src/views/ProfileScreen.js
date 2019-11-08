import React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import {Card, Overlay, Button, CheckBox} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome5';

import Header from '../components/Header';
import FieldSet from '../components/FieldSet';

import { Auth, Firestore } from './../api/Firebase';
import MediaHelper from '../helpers/MediaHelper';
import {TextField} from 'react-native-material-textfield';
import {ScrollView} from "react-native-gesture-handler";
import Moment from 'moment';
import Toast from 'react-native-easy-toast';

export default class ProfileScreen extends React.Component {

    state = {
        showEditOverlay: false,
        nextDonationDay: '',
        user: { auth: { }, data: { } },
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
            name: '',
            phone_number: '',
            city: ''
        },
        emailValid: true,
        emailErrorMsg: '',
    }

    async componentDidMount() {

        let user = await Auth.getLoggedUser();
        this.setState(user);

        if (this.state.user.data.sex === 'male') {
            let oldState = this.state.inputs;
            oldState.sex[0].selected = true;
            this.setState({inputs: oldState})
        } else {
            let oldState = this.state.inputs;
            oldState.sex[1].selected = true;
            this.setState({inputs: oldState})
        }

        if (this.state.user.data.blood_type) {
            this.handleBloodTypeChange(this.state.user.data.blood_type);
        }

        this.getNextDonationDate();
    }

    validateInput(field) {

        let oldState = this.state.inputError;

        if (this.state.user.data[field] === '') {

            oldState[field] = 'Preencha o campo corretamente!';

        } else{

            oldState[field] = '';
        }

        this.setState({ inputError: oldState });
    }

    renderBloodBall() {

        return (

            <View style={{marginTop: 6, marginLeft: 6, justifyContent: 'center', alignItems: 'center', width: 50, height: 50, borderRadius: 50/2, backgroundColor: '#ff4949', marginBottom: 10}}>
                <Text style={{color: '#FFFFFF', fontWeight: 'bold', fontSize: 22}}> { this.state.user.data.blood_type ? this.state.user.data.blood_type : '?' } </Text>
            </View>
        );
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
        this.handleInputValue('sex', sex)
    }

    handleInputValue(input, value) {

        let previousState = this.state.user;
        previousState.data[input] = value;

        this.setState({ user: previousState });
    }

    validateEmail(text) {
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ ;

        if(reg.test(text) === false)
        {
            this.setState({ emailValid: false, emailErrorMsg: 'E-mail Inválido!' })
        }
        else {
            this.setState({ emailValid: true, emailErrorMsg: '' });
        }
    }

    renderEditModal() {

        return (
            <Overlay isVisible={ this.state.showEditOverlay } height={ 'auto' } width={'95%'}>
                <View>

                    <FieldSet title={'Alterar Dados'}/>

                    <TextField onBlur={ () => { this.validateInput('name') } } error={this.state.inputError.name} value={this.state.user.data.name} onChangeText={ (value) => this.handleInputValue('name', value) } label={'Nome'} tintColor='#ff4949' lineWidth={1}/>
                    <TextField onBlur={ () => { this.validateInput('phone_number') } } error={this.state.inputError.phone_number} value={this.state.user.data.phone_number} onChangeText={ (value) => this.handleInputValue('phone_number', value) } label={'Telefone'} tintColor='#ff4949' lineWidth={1}/>
                    <TextField error={this.state.emailErrorMsg} value={this.state.user.data.email} onBlur={ () => { this.validateEmail(this.state.user.data.email) } } onChangeText={ (value) => this.handleInputValue('email', value) } label={'Email'} tintColor='#ff4949' lineWidth={1}/>
                    <TextField onBlur={ () => { this.validateInput('city') } } error={this.state.inputError.city} value={this.state.user.data.city} onChangeText={ (value) => this.handleInputValue('city', value) } label={'Cidade'} tintColor='#ff4949' lineWidth={1}/>

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

                    <Button  iconRight icon={ <Icon size={17} style={{marginLeft: '5%', color: 'white'}} solid alt name={'check'}/> } onPress={() => { this.handleEditOverlay() }} raised={true} titleStyle={{fontSize: 18, fontWeight: 'bold'}} buttonStyle={{ backgroundColor: '#ff4949'}} title={'CONFIRMAR'}/>

                    <Toast ref="errorToast"
                           style={{backgroundColor:'red'}}
                           position='bottom'
                           positionValue={180}
                           fadeInDuration={1000}
                           fadeOutDuration={1000}
                           opacity={0.8}
                    />

                </View>
            </Overlay>
        );
    }

    handleEditOverlay() {

        if (this.state.showEditOverlay && this.state.emailValid) {


            let valid = true;
            let inputsError = this.state.inputError;

            for( let key in inputsError ) {
                if(inputsError[key] !== "") {
                    valid = false;
                }
            }

            if (valid) {
                this.setState({ showEditOverlay: false });
                Firestore.update('users', this.state.user.auth.currentUser.uid, this.state.user.data);

                this.refs.toast.show('Informações Atualizadas!', 4000)
            } else {
                this.refs.errorToast.show('Preencha os campos corretamente!', 4000)
            }

        } else {

            this.setState({ showEditOverlay: true });
        }
    }

    async getNextDonationDate() {

        let userId = this.state.user.auth.currentUser.uid;

        let donations = [];
        let collection = await Firestore.getCollection('donations', ['date', 'desc'], 100, ['user', '==', userId]);

        collection.docs.map( (doc) => {
            donations.push(doc.data());
        });

        donations.sort(function(a,b){
            return new Date(b.date.toDate()) - new Date(a.date.toDate())
        });

        let date = Moment(donations[0].date.toDate());
        let daysToAdd = this.state.user.data.sex === 'male' ? 60 : 90;

        date.add(daysToAdd, 'days');

        this.setState({ nextDonationDay: date.format('DD/MM/YYYY') });
    }

    render() {
        return (
            <View style={styles.mainContainer}>
                <Header title={'MEU PERFIL'}/>

                <Card containerStyle={{ height: '89%' }}>
                    <ScrollView contentContainerStyle={{alignItems: "center", justifyContent: "center"}}>
                        <Image source={ require('./../assets/images/user_empty.png') } style={{width: 150, height: 150, borderRadius: 150/2}}/>

                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>

                            <Text style={styles.mainTitle}> { this.state.user.data.name } </Text>

                            { this.renderBloodBall() }

                        </View>

                        <FieldSet title={'Meus Dados'}/>

                        <View style={{ width: '100%' }}>
                            <View style={ styles.userFieldContainer }>
                                <Text style={ styles.userFieldPrimary }>E-mail</Text>
                                <Text style={ styles.userFieldSecondary }> { this.state.user.data.email } </Text>
                            </View>

                            <View style={ styles.userFieldContainer }>
                                <Text style={ styles.userFieldPrimary }>Telefone</Text>
                                <Text style={ styles.userFieldSecondary }> { this.state.user.data.phone_number } </Text>
                            </View>

                            <View style={ styles.userFieldContainer }>
                                <Text style={ styles.userFieldPrimary }>Cidade</Text>
                                <Text style={ styles.userFieldSecondary }> { this.state.user.data.city } </Text>
                            </View>

                            <View style={ styles.userFieldContainer }>
                                <Text style={ styles.userFieldPrimary }>Tipo Sanguíneo</Text>
                                <Text style={ styles.userFieldSecondary }> { this.state.user.data.blood_type } </Text>
                            </View>

                            <View style={ styles.userFieldContainer }>
                                <Text style={ styles.userFieldPrimary }>Sexo</Text>
                                <Text style={ styles.userFieldSecondary }> { this.state.user.data.sex == 'male' ? 'Masculino' : 'Feminino' } </Text>
                            </View>

                            <View style={{ flexDirection: 'row', justifyContent: 'center', paddingVertical: 15 }}>
                                <Icon onPress={ () => { this.handleEditOverlay() } } name={ 'edit' } size={ 25 } color={ '#ff4949' }/>
                            </View>

                        </View>

                        <FieldSet title={'Próxima Doação'}/>
                        <Text> { this.state.nextDonationDay } </Text>

                        <View style={styles.divider}/>

                        <View style={{ width: '100%' }}>
                            <Button  iconRight icon={ <Icon size={17} style={{marginLeft: '5%', color: 'white'}} solid alt name={'tint'}/> } onPress={() => { this.props.navigation.navigate('UserDonations') }} raised={true} titleStyle={{fontSize: 18, fontWeight: 'bold'}} buttonStyle={{ backgroundColor: '#ff4949'}} title={'MINHAS DOAÇÕES'}/>
                        </View>

                        { this.renderEditModal() }

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
            </View>
        );
    }
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#ededed',
    },
    mainTitle: {
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        paddingVertical: 15,
    },
    userFieldContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap'
    },
    userFieldPrimary: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        fontWeight: 'bold',
        fontSize: 17,
        textAlign: 'left'
    },
    userFieldSecondary: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        // padding: 15,
        fontSize: 15,
        textAlign: 'right',
        flexWrap: 'wrap',
    },
    divider: {
        marginTop: '8%',
    },
    label: {
        fontSize: 16,
        color: 'grey',
        textAlign: 'left'
    },
})
