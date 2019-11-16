import React from 'react';
import { View, StyleSheet, Image, Text, Switch } from 'react-native';
import {Card, Overlay, Button, Slider} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome5';

import Header from '../components/Header';
import FieldSet from '../components/FieldSet';
import {Auth, Firestore} from '../api/Firebase';
import {ScrollView} from "react-native-gesture-handler";

export default class ProfileScreen extends React.Component {

    state = {
        user: { auth: { }, data: { } },
        showEditOverlay: false,
        showAboutModal: false,
        showTermModal: false
    }

    async componentDidMount() {
        let user = await Auth.getLoggedUser();
        this.setState(user);
    }

    handleSwitchChange(field) {

        let oldState = this.state.user;
        oldState.data[field] = !oldState.data[field];

        this.setState({ user: oldState });

        Firestore.update('users', this.state.user.auth.currentUser.uid, this.state.user.data);
    }

    handleRangeChange(value, field) {

        let oldState = this.state.user;
        oldState.data[field] = value;

        this.setState({ user: oldState });

        Firestore.update('users', this.state.user.auth.currentUser.uid, this.state.user.data);
    }

    showModal(modalName) {

        let oldState = this.state;

        oldState[modalName] = !oldState[modalName];

        this.setState({ oldState });
    }

    render() {
        return (
            <View style={styles.mainContainer}>
                <Header title={'CONFIGURAÇÕES'}/>

                <Card containerStyle={{ height: '84%' }}>
                    <View style={{alignItems: "center", justifyContent: "center"}}>
                        <View style={styles.divider}/>

                        <View style={{ width: '100%' }}>

                            <View style={styles.userFieldContainer}>
                                <Text style={ styles.userFieldPrimary }>{'Notificar Novos Pedidos'}</Text>
                                <View style={ styles.userFieldSecondary }>
                                    <Switch onChange={() => { this.handleSwitchChange('notify_blood_requests') }} value={this.state.user.data.notify_blood_requests}/>
                                </View>
                            </View>
                            <View style={styles.userFieldContainer}>
                                <Text style={ styles.userFieldPrimary }>{'Notificar Próxima Doação'}</Text>
                                <View style={ styles.userFieldSecondary }>
                                    <Switch onChange={() => { this.handleSwitchChange('notify_next_donation') }} value={this.state.user.data.notify_next_donation} />
                                </View>
                            </View>

                            <View style={styles.userFieldContainer}>
                                <Text style={ styles.userFieldPrimary }>{'Notificar Apenas Pedidos Compatíveis'}</Text>
                                <View style={ styles.userFieldSecondary }>
                                    <Switch onChange={() => { this.handleSwitchChange('notify_only_compatible') }} value={this.state.user.data.notify_only_compatible} />
                                </View>
                            </View>

                            <View style={styles.divider}/>

                            <Text style={ styles.userFieldPrimary }>{'Distância Mínima Notificações'}</Text>

                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: '3%' }}>
                                <Slider step={1} style={{width: '68%'}} thumbTintColor={'#ff4949'} minimumTrackTintColor={'#ff4949'} minimumValue={ 1 } maximumValue={ 100 } value= { this.state.user.data.notifRange } onSlidingComplete={ (value) => { this.handleRangeChange(value, 'notifRange') } }/>
                                <Text style={styles.daysText}> { this.state.user.data.notifRange >= 100 ? 'Sem Filtro' : this.state.user.data.notifRange } { this.state.user.data.notifRange < 100 ? 'km' : '' } </Text>
                            </View>

                            <View style={styles.divider}/>

                            <Text style={ styles.userFieldPrimary }>{'Lembrete da Próxima Doação'}</Text>

                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: '3%' }}>
                                <Slider step={1} style={{width: '68%'}} thumbTintColor={'#ff4949'} minimumTrackTintColor={'#ff4949'} minimumValue={ 1 } maximumValue={ 5 } value= { this.state.user.data.next_donation_reminder } onSlidingComplete={ (value) => { this.handleRangeChange(value, 'next_donation_reminder') } }/>
                                <Text style={styles.daysText}> {  this.state.user.data.next_donation_reminder } { 'dias antes' } </Text>
                            </View>

                            <View style={styles.divider}/>

                            <View style={{ }}>

                                <Button  iconRight icon={ <Icon size={17} style={{marginLeft: '5%', color: 'white'}} solid alt name={'info-circle'}/> } onPress={() => { this.showModal('showAboutModal') }} raised={true} titleStyle={{fontSize: 18, fontWeight: 'bold'}} buttonStyle={{ backgroundColor: '#ff4949'}} title={'SOBRE O APLICATIVO'}/>
                                <Overlay overlayStyle={{marginTop: 30, width: '92%', height: 'auto'}} isVisible={ this.state.showAboutModal }>
                                    <View>
                                        <Text style={{ fontWeight: 'bold', fontSize: 15, paddingBottom: 12 }}> Sobre o Aplicativo </Text>
                                        <Text style={{ flexWrap: 'wrap', fontSize: 15, paddingBottom: 12 }}>Esse aplicativo foi desenvolvido para o trabalho final do curso de Sistemas de Informação - Unochapecó. </Text>
                                        <Text style={{ flexWrap: 'wrap', fontSize: 15, paddingBottom: 12 }}>Desenvolvido por Weiler Cavasotto.</Text>
                                        <Text style={{ flexWrap: 'wrap', fontSize: 15, paddingBottom: 12, justifyContent: 'center' }}>v0.1</Text>
                                        <Button onPress={ () => { this.showModal('showAboutModal') } } buttonStyle={{ justifyContent: 'center', backgroundColor: '#ff4949' }} titleStyle={{ fontWeight: 'bold' }} iconRight icon={ <Icon style={{ marginLeft: 10 }} name={'check'} solid color={'white'} size={20}/> } title={'Fechar'} />
                                    </View>
                                </Overlay>

                                <View style={styles.divider}/>
                                <Button onPress={() => { this.showModal('showTermModal') }}  iconRight icon={ <Icon size={17} style={{marginLeft: '5%', color: 'white'}} solid alt name={'book'}/> } raised={true} titleStyle={{fontSize: 18, fontWeight: 'bold'}} buttonStyle={{ backgroundColor: '#ff4949'}} title={'TERMOS DE USO'}/>
                                <Overlay overlayStyle={{marginTop: 30, width: '92%', height: 'auto'}} isVisible={ this.state.showTermModal }>
                                    <View>
                                        <Text style={{ fontWeight: 'bold', fontSize: 15, paddingBottom: 12 }}> Sobre o Aplicativo </Text>
                                        <Text style={{ flexWrap: 'wrap', fontSize: 15, paddingBottom: 12 }}>Esse aplicativo foi desenvolvido para o trabalho final do curso de Sistemas de Informação - Unochapecó. </Text>
                                        <Text style={{ flexWrap: 'wrap', fontSize: 15, paddingBottom: 12 }}>Desenvolvido por Weiler Cavasotto.</Text>
                                        <Text style={{ flexWrap: 'wrap', fontSize: 15, paddingBottom: 12, justifyContent: 'center' }}>v0.1</Text>
                                        <Button onPress={ () => { this.showModal('showTermModal') } } buttonStyle={{ justifyContent: 'center', backgroundColor: '#ff4949' }} titleStyle={{ fontWeight: 'bold' }} iconRight icon={ <Icon style={{ marginLeft: 10 }} name={'check'} solid color={'white'} size={20}/> } title={'Fechar'} />
                                    </View>
                                </Overlay>

                                <View style={styles.divider}/>
                                <Button  iconRight icon={ <Icon size={17} style={{marginLeft: '5%', color: 'white'}} solid alt name={'sign-out-alt'}/> } onPress={() => { Auth.logout() }} raised={true} titleStyle={{fontSize: 18, fontWeight: 'bold'}} buttonStyle={{ backgroundColor: '#ff4949'}} title={'SAIR'}/>

                            </View>

                        </View>

                    </View>
                </Card>
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
        flexWrap: 'wrap',
        alignItems: 'center',
        paddingVertical: '3%'
    },
    userFieldPrimary: {
        // paddingVertical: 5,
        paddingHorizontal: 10,
        fontWeight: 'bold',
        fontSize: 15,
        textAlign: 'left',
    },
    userFieldSecondary: {
        // paddingVertical: 5,
        paddingHorizontal: 10,
        // padding: 15,
        fontSize: 13,
        textAlign: 'right',
        flexWrap: 'wrap',
    },
    divider: {
        marginTop: '8%',
    },
    daysText: {
        color: 'grey',
        paddingLeft: 15
    },
});
