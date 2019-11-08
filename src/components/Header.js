import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

// SE FOR IPHONE MANTER O MESMO HEIGH SE NAO MUDAR PARA ANDROID

export default class Header extends React.Component {

    constructor (props) {
        super(props);
    }

    renderBackButton() {
        return (
            <TouchableOpacity onPress={() => { this.props.navigator.goBack(null) }} style={{position: 'absolute', left: 0, paddingHorizontal: 10, marginTop: Platform.OS == 'ios' ? '5%' : 0}}>
                <Icon name={'angle-left'} size={30} color={'white'}/>
            </TouchableOpacity>     
        )
    }

    render() {
        return (
            <View style={styles.header}>
                <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%', marginTop: Platform.OS == 'ios' ? '5%' : 0,}}>

                    { this.props.backScreen ? this.renderBackButton() : null }

                    <Text style={styles.title}>
                        {this.props.title}
                    </Text>
                </View>
            </View>
        );
    }
};

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#ff4949',
        height: Platform.OS == 'ios' ? '12%' : '8%',
        alignItems: 'center',
    },
    title: {
        fontWeight: 'bold',
        fontSize: 18,
        color: 'white',
        // fontFamily: 'Montserrat-Bold',
    }
})