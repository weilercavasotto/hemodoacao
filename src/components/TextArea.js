import React from 'React';
import { View, TextInput, StyleSheet } from 'react-native';

export default class TextArea extends React.Component {

    state = {
        value: '',
        inputColor: 'grey'
    }

    constructor (props) {
        super(props);
    }

    render() {

        return (

            <View style={{ borderRadius: 4, borderColor: this.state.inputColor, borderWidth: 1, marginVertical: 25, padding: 5, }} >
                <TextInput
                style={styles.textArea}
                underlineColorAndroid="transparent"
                placeholder= { this.props.placeholder }
                placeholderTextColor="grey"
                numberOfLines={10}
                multiline={true}
                onFocus={ () => { this.setState({ inputColor: '#ff4949' }) } }
                onBlur={ () => { this.setState({ inputColor: 'grey' }) } }
                value={this.props.value}
                onChangeText={ (value) => {this.props.callback(value)} }
                ref={'obs'}
                />
          </View>
        );
    }
};

const styles = StyleSheet.create({
      textArea: {
        height: 150,
        justifyContent: "flex-start",
          textAlignVertical: 'top'
      }
})
