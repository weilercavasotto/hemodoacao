import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity
} from 'react-native';

import { Button } from 'react-native-elements';
import { TextField } from 'react-native-material-textfield';
import Icon from 'react-native-vector-icons/FontAwesome5';

import firebase from 'react-native-firebase';
import Toast from 'react-native-easy-toast';

import { AccessToken, LoginManager } from 'react-native-fbsdk';
import { Auth } from './../api/Firebase';

export default class LoginPage extends React.Component {

    static navigationOptions = { header: null }

    state = {
        email: '',
        password: '',
    }

    componentDidMount() {
        // Auth.logout();
        firebase.auth().onAuthStateChanged(user => {
            this.props.navigation.navigate(user ? 'Home' : 'Login')
        })
    }

    async facebookLogin() {

        try {

            let result = LoginManager.logInWithPermissions(['public_profile', 'email']);

            if (result.isCancelled) {

                console.log("Login canceled!");

            } else {

                const accessToken = await AccessToken.getCurrentAccessToken();

                if (accessToken) {
                    Auth.registerFacebookUser(accessToken);
                }
            }

        } catch (e) {

            console.log('Error: ' + e);
        }
    }

    handleLogin() {

        firebase
          .auth()
          .signInWithEmailAndPassword(this.state.email, this.state.password)
          .then(() => this.props.navigation.navigate('Home'))
          .catch(error => {
              this.refs.toastError.show('Usuário ou Senha inválido!', 8000);
          })
    }

    handleInput(field, value) {

        let state = this.state;
        state[field] = value;

        this.setState({state});
    }

    render() {

        return (
            <View style={styles.mainContainer}>
                <Toast ref="toastError"
                       style={{backgroundColor:'red'}}
                       position='bottom'
                       positionValue={180}
                       fadeInDuration={1000}
                       fadeOutDuration={1000}
                       opacity={0.8}
                />
                <View style={styles.container}>
                    <View style={styles.logo}>
                        <Icon name='tint' size={30} color={'#ff4949'}/>
                        <Text style={styles.title}>PROTÓTIPO TCC</Text>
                    </View>
                    <View style={styles.loginView}>
                        <View style={styles.inputGroup}>
                            <TextField
                                label='E-mail'
                                labelFontSize={15}
                                // baseColor='#ff4949'
                                tintColor='#ff4949'
                                lineWidth={1}
                                containerStyle={styles.loginInput}
                                onChangeText={ (value) => { this.handleInput('email', value) } }
                                autoCapitalize = 'none'
                            />
                            <TextField
                                onChangeText={ (value) => { this.handleInput('password', value) } }
                                secureTextEntry={true}
                                label='Senha'
                                labelFontSize={15}
                                // baseColor='#ff4949'
                                tintColor='#ff4949'
                                lineWidth={1}
                                containerStyle={styles.loginInput}
                                autoCapitalize = 'none'
                            />
                        </View>
                        <Button onPress={() => { this.handleLogin() }} raised={true} containerStyle={styles.loginButton}  titleStyle={{fontSize: 18, fontWeight: 'bold'}} buttonStyle={{backgroundColor: '#ff4949'}} title={'ENTRAR'}/>
                        <Button onPress={() => this.props.navigation.navigate('BloodRequest')} iconRight icon={<Icon style={{marginLeft: '5%'}} solid color={'white'} name={'user'} size={17} />} raised={true} containerStyle={styles.loginButton}  titleStyle={{fontSize: 18, fontWeight: 'bold'}} buttonStyle={{backgroundColor: '#ff4949'}} title={'SOLICITAR DOAÇÃO'}/>
                        <Button onPress={() => { this.facebookLogin() }} iconRight icon={<Icon style={{marginLeft: '5%'}} solid color={'white'} name={'facebook'} size={17} />} raised={true} containerStyle={styles.facebookButton}  titleStyle={{fontSize: 18, fontWeight: 'bold'}} buttonStyle={{backgroundColor: '#3c5591'}} title={'ENTRAR COM FACEBOOK'}/>
                        <TouchableOpacity onPress={ () => { this.props.navigation.navigate('Register')} } style={{marginTop: '3%', alignItems: 'center', paddingBottom: '10%'}}>
                            <Text style={styles.registerText}> Não possui uma conta? Cadastre-se. </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        backgroundColor: 'white',
        // height: '82%',
        marginLeft: 10,
        marginRight: 10,
        borderRadius: 5,
    },
    mainContainer: {
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
        backgroundColor: '#ff4949'
    },
    loginView: {
        width: '75%',
    },
    loginButton: {
        marginTop: '3%'
    },
    facebookButton: {
        marginTop: '10%'
    },
    loginInput: {
        paddingTop: '3%',
    },
    inputGroup: {
        marginBottom: '15%'
    },
    loginLabel: {
        color: '#ff4949',
    },
    title: {
        fontSize: 35,
        fontWeight: 'bold',
        color: '#ff4949',
    },
    logo: {
        // bottom: '5%',
        paddingTop: '15%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerText: {
        color: '#FF4949',
        textDecorationLine: 'underline'
    }
})
