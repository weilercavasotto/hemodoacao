import React from 'react';
import { View , StyleSheet, Text } from 'react-native';

export default class FieldSet extends React.Component {
    
    constructor (props) {
        super(props);
    }

    render() {

        return (
            <View style={styles.container}>
                <Text style={styles.title}> { this.props.title } </Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 25,
        alignItems: 'flex-start',
        // flex: 1,
        // flexDirection: 'row',
        paddingHorizontal: 0,
        marginHorizontal: 0
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ff4949',
        paddingHorizontal: 0,
        marginHorizontal: 0
    }
})