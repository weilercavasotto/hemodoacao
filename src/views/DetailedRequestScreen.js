import React from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    ActivityIndicator,
} from 'react-native';

import {Button, Card, Overlay, Text} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Moment from 'moment';

import Header from '../components/Header';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';

import BloodRequestHelper from '../helpers/BloodRequestHelper';
import MediaHelper from '../helpers/MediaHelper';

import firebase from "react-native-firebase";
import Share from 'react-native-share';

export default class DetailedRequestScreen extends React.Component {

    state = {
        user: { auth: { }, data: { } },
        request: null,
        showMapModal: false,
        requestRegion: {
            latitude: -23.575035,
            longitude: -46.617483,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421
        }
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {

        this.getLoggedUser();
        this.setBloodRequest();
    }

    async getLoggedUser() {

        const loggedUser  = firebase.auth();

        let uid = loggedUser.currentUser.uid;
        let doc = await firebase.firestore().collection('users').doc(uid).get();

        if (doc.exists) {

            this.setState({ user: { auth: loggedUser, data: doc.data() } });

        } else {

            this.setState({ user: { auth: loggedUser } });
        }
    }

    setBloodRequest() {
        let requestParam = this.props.navigation.getParam('request');
        this.setState({ request: requestParam });

        if (requestParam.geometry_location) {

            let split = requestParam.geometry_location.split(',');

            let region = {
                latitude: parseFloat(split[0]),
                longitude: parseFloat(split[1]),
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421
            };

            this.setState({ requestRegion: region })
        }
    }

    locationMapModal() {
        this.setState({ showMapModal: !this.state.showMapModal });
    }

    showLocationOnMap() {

        return (
            <Overlay overlayStyle={{ padding: 0, margin: 0, width: '95%' }} isVisible={ this.state.showMapModal }>

                <MapView
                    showsUserLocation={ true }
                    loadingEnabled={ true }
                    provider={PROVIDER_GOOGLE}
                    style={{flex: 1}}
                    followsUserLocation={ true }
                    zoomControlEnabled={true}
                    region={ (this.state.requestRegion) }
                    pitchEnabled={true} >

                    <Marker coordinate={{ latitude: this.state.requestRegion.latitude, longitude: this.state.requestRegion.longitude }} >
                        <View>
                            <Icon name={'tint'} color={'#ff4949'} size={30}/>
                        </View>
                    </Marker>

                </MapView>

                <Button onPress={() => { this.locationMapModal() } } iconRight icon={<Icon style={{marginLeft: '5%'}} solid color={'white'} name={'map-marker-alt'} size={17} />} raised={true} titleStyle={{fontSize: 18, fontWeight: 'bold'}} buttonStyle={{ backgroundColor: '#ff4949'}} title={'FECHAR'}/>

            </Overlay>
        )
    }

    handleDaysToDonate() {

        let actualDate = Moment();

        let donateDate = Moment(this.state.request.date.toDate());
        // donateDate.add(this.state.request.daysToDonate, 'days');

        let days = this.state.request.daysToDonate - donateDate.diff(actualDate, 'days');

        return (days >= 0 ? 'Restam ' + days + (days > 1 ? ' dias' : ' dia') : (days == 0) ? 'Hoje é o último dia' : 'Período expirado' );
    }

    renderRequestInfo() {

        const mapButton = <Button  iconRight icon={ <Icon size={17} style={{marginLeft: '5%', color: 'white'}} solid name={'map-marked-alt'}/> } onPress={() => { this.locationMapModal() }} raised={true} titleStyle={{fontSize: 18, fontWeight: 'bold'}} buttonStyle={{backgroundColor: '#ff4949'}} title={'VER NO MAPA'}/>;

        return (
            <View style={{ width: '100%' }}>
                <View style={ styles.userFieldContainer }>
                    <Text style={ styles.userFieldPrimary }>Solicitante</Text>
                    <Text style={ styles.userFieldSecondary }> { this.state.request.user_name } </Text>
                </View>
                <View style={ styles.userFieldContainer }>
                    <Text style={ styles.userFieldPrimary }>E-mail</Text>
                    <Text style={ styles.userFieldSecondary }> { this.state.request.user_email } </Text>
                </View>
                <View style={ styles.userFieldContainer }>
                    <Text style={ styles.userFieldPrimary }>Data</Text>
                    <Text style={ styles.userFieldSecondary }> { Moment(this.state.request.date.toDate()).format('DD/MM/YYYY') } </Text>
                </View>
                <View style={ styles.userFieldContainer }>
                    <Text style={ styles.userFieldPrimary }>Hemocentro Doação</Text>
                    <Text style={ styles.userFieldSecondary }> { this.state.request.hemocentro } </Text>
                </View>
                <View style={ styles.userFieldContainer }>
                    <Text style={ styles.userFieldPrimary }>Endereço</Text>
                    <Text style={ styles.userFieldSecondary }> { this.state.request.address } </Text>
                </View>
                <View style={ styles.userFieldContainer }>
                    <Text style={ styles.userFieldPrimary }>Fone</Text>
                    <Text style={ styles.userFieldSecondary }> { this.state.request.user_phone } </Text>
                </View>
                <View style={ styles.userFieldContainer }>
                    <Text style={ styles.userFieldPrimary }>Paciente</Text>
                    <Text style={ styles.userFieldSecondary }> { this.state.request.pacient_name } </Text>
                </View>
                <View style={ styles.userFieldContainer }>
                    <Text style={ styles.userFieldPrimary }>Sexo</Text>
                    <Text style={ styles.userFieldSecondary }> { (this.state.request.pacient_sex === 'male' ? 'Masculino' : 'Feminino') } </Text>
                </View>
                <View style={ styles.userFieldContainer }>
                    <Text style={ styles.userFieldPrimary }>Motivo Doação</Text>
                    <Text style={ styles.userFieldSecondary }> { this.state.request.donate_reason } </Text>
                </View>
                {this.state.request.obs
                    ?   <View style={ styles.userFieldContainer }>
                            <Text style={ styles.userFieldPrimary }>Observação</Text>
                            <Text style={ styles.userFieldSecondary }> { this.state.request.obs } </Text>
                        </View>
                    : null
                }
                <View style={ styles.userFieldContainer }>
                    <Text style={ styles.userFieldPrimary }>Dias para Doar</Text>
                    <Text style={ styles.userFieldSecondary }> { this.handleDaysToDonate() } </Text>
                </View>

                <View style={styles.divider}/>

                { this.state.request.geometry_location ? mapButton : null }
                { this.state.request.geometry_location ? this.showLocationOnMap() : null }

                <View style={{ marginTop: '3%' }}/>

                { this.renderBloodComparation() }

                <View style={{ marginTop: '5%' }}/>
                <Button  iconRight icon={ <Icon size={17} style={{marginLeft: '5%', color: 'white'}} solid alt name={'phone'}/> } onPress={() => { MediaHelper.callNumber(this.state.request.user_phone) }} raised={true} titleStyle={{fontSize: 18, fontWeight: 'bold'}} buttonStyle={{backgroundColor: '#ff4949'}} title={'ENTRAR EM CONTATO'}/>

                <View style={{ marginTop: '5%' }}/>
                <Button  iconRight icon={ <Icon size={17} style={{marginLeft: '5%', color: 'white'}} solid alt name={'envelope'}/> } onPress={() => { MediaHelper.sendEmail(this.state.request.user_email) }} raised={true} titleStyle={{fontSize: 18, fontWeight: 'bold'}} buttonStyle={{backgroundColor: '#ff4949'}} title={'ENVIAR E-MAIL'}/>

                <View style={{ marginTop: '5%' }}/>
                <Button  iconRight icon={ <Icon size={17} style={{marginLeft: '5%', color: 'white'}} solid alt name={'share-alt'}/> } onPress={() => { this.shareBloodRequest() }} raised={true} titleStyle={{fontSize: 18, fontWeight: 'bold'}} buttonStyle={{backgroundColor: '#ff4949'}} title={'COMPARTILHAR'}/>

            </View>
        );
    }

    shareBloodRequest() {

        let options = {
            url: '',
            title: 'Doação de Sangue para ' + this.state.request.pacient_name,
            subject: 'Doação de Sangue para ' + this.state.request.pacient_name,
            message:  this.state.request.pacient_name + ' precisa de sua ajuda com uma doação de sangue no Hemocentro ' + this.state.request.hemocentro + ', ajude compartilhando essa mensagem.'
        }

        Share.open(options)
            .then((res) => { console.log(res) })
            .catch((err) => { err && console.log(err); });
    }

    renderBloodComparation() {

        let asked = this.state.request.requested_blood_type;
        let myType = this.state.user.data.blood_type

        let compatible = BloodRequestHelper.compareBloodType(myType, asked);

        return (
            <View>
                <View style={ styles.userFieldContainer }>
                    { this.renderBloodBall( asked, 'SOLICITADO' ) }
                    { this.renderBloodBall( myType, 'MEU TIPO' ) }
                </View>
                <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row'}}>
                    <Icon name={compatible ? 'check-circle' : 'times'} solid size={25} color={'#ff4949'} style={{marginRight: '3%'}}/>
                    <Text style={{fontWeight: 'bold'}}>{ compatible ? 'Compatível!' : 'Não compatível.'}</Text>
                </View>
                { !compatible ? <View style={{ justifyContent: 'center', alignItems: 'center'}}><Text style={{fontWeight: 'bold'}}>{ 'Ajude compartilhando esse pedido!' }</Text></View> : null }
            </View>
        );
    }

    renderLoadingIndicator() {
        return(
            <View style={{ flex: 1, padding: 20 }}>
                <ActivityIndicator/>
            </View>
        )
    }

    renderBloodBall(type, label) {
        return (
            <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold', marginBottom: '6%' }}> { label } </Text>
                <View style={ styles.bloodBall }>
                    <Text style={ styles.bloodBallText }>{ BloodRequestHelper.handleBloodType(type) }</Text>
                </View>
            </View>
        );
    }

    render() {
        return (
            <View style={styles.mainContainer}>
                <Header backScreen={'Login'} navigator={ this.props.navigation } title={'INFORMAÇÕES'}/>
                <Card containerStyle={{ height: '89%' }}>
                    <ScrollView contentContainerStyle={{alignItems: "center", justifyContent: "center"}}>
                        <Text style={{ fontSize: 20, color: '#ff4949', fontWeight: 'bold' }}> PEDIDO DE DOAÇÃO </Text>

                        <View style={{ marginTop: '5%'}}/>

                        { this.state.request ? this.renderRequestInfo() : this.renderLoadingIndicator() }

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
    bloodBall: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 60,
        height: 60,
        borderRadius: 60/2,
        backgroundColor: '#ff4949',
        marginHorizontal: '10%'
    },
    bloodBallText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 30
    },
});
