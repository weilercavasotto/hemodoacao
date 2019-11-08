import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Card } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import BloodRequestHelper from '../helpers/BloodRequestHelper';

export default class BloodRequest extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Card containerStyle={ style.mainContainer }>
                <TouchableOpacity onPress={this.props.onClick}>
                    <View style={ style.cardContainer }>
                        <View style={ style.bloodBall }>
                            <Icon name={'tint'} color={'white'} size={45}/>
                        </View>
                        <View style={{justifyContent: 'center', paddingLeft: 10}}>
                            <Text style={ style.containerPrimaryText }> { this.props.hemocentro } </Text>
                            <Text style={ style.containerSecondaryText }> { this.props.city } </Text>
                            <Text style={ style.containerSecondaryText }> { this.props.date } </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </Card>
        );
    }
};

const style = StyleSheet.create({
    mainContainer: {
        marginHorizontal: 8,
        borderRadius: 10,
        borderColor: '#F6F5F5',
        marginTop: 10
    },
    bloodBall: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 60,
        height: 60,
        borderRadius: 60/2,
        backgroundColor: '#ff4949'
    },
    bloodBallText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 30
    },
    containerSecondaryText: {
        color: 'grey',
        fontSize: 16
    },
    containerPrimaryText: {
        fontWeight: 'bold',
        fontSize: 16
    },
    cardContainer: {
        flexDirection: 'row',
        flex: 1
    },
    iconContainer: {
        position: 'absolute',
        right: 0
    }
});
