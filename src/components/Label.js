import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Tooltip } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome5';

export default class Label extends React.Component {

    constructor(props) {
        super(props);
    }

    renderTooltip() {

        return (
                <Tooltip height={ 70 } width={ 300 }  popover={ <Text> { this.props.tooltipText } </Text> } withOverlay={ false } toggleOnPress={ true } backgroundColor={'#f0f6fc'}>
                    <Icon color={ 'grey' } style={{marginTop: 3, marginLeft: 3}} size={15} name={'question-circle'}/>
                </Tooltip>
        );
    }

    render() {
        
        return (
            <View style={{flex: 1, flexDirection: 'row'}}>
                <Text style={styles.label}> { this.props.title } </Text>

                { this.props.tooltip && this.props.tooltipText ? this.renderTooltip() : null }

            </View>
        );
    }
}

const styles = StyleSheet.create({
    label: {
        fontSize: 16,
        color: 'grey',
        textAlign: 'left'
    },
})