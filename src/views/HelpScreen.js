import React from 'react';
import { View, StyleSheet, Image, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Button, SearchBar, Overlay } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome5';

import Header from '../components/Header';

import Faq from './../assets/helpScreenInfo';

export default class ProfileScreen extends React.Component {

    state = {
        showModal: false,
        searchValue: '',
        questions: Faq.questions,
        modalData: 0
    };

    showQuestionModal(key) {

        this.setState({ modalData: key });

        let oldState = this.state;
        oldState.showModal = !oldState.showModal;

        this.setState({ oldState })
    }

    renderHelpCard(element, key) {

        return (
            <View key={key}>

                <Card containerStyle={styles.cardContainer}>

                    <TouchableOpacity onPress={ () => { this.showQuestionModal(key) } }>
                        <View style={styles.cardBodyContainer}>
                            <Icon name={'question-circle'} color={'#ff4949'} size={25}/>
                            <Text style={styles.questionText}>{element.title}</Text>
                        </View>
                    </TouchableOpacity>
                </Card>
            </View>
        );
    }

    getTitle() {

        if (this.state.questions[this.state.modalData]) {
            return this.state.questions[this.state.modalData].title;
        }
    }

    getBody() {

        if (this.state.questions[this.state.modalData]) {
            return this.state.questions[this.state.modalData].body;
        }
    }

    resetQuestions() {
        this.setState({ questions: Faq.questions });
    }

    searchBar(text) {

        if (text == '') {

            this.setState({ searchValue: '' })
            this.resetQuestions();

        } else {

            let arrayHolder = this.state.questions;

            const newData = arrayHolder.filter( (item) => {

                const itemData = item.title ? item.title.toUpperCase() : ''.toUpperCase();

                const textData = text.toUpperCase();
                return itemData.indexOf(textData) > -1;
            });

            this.setState({ searchValue: text, questions: newData });

            if (text.length < this.state.searchValue.length) {
                this.setState({ searchValue: '' });
                this.resetQuestions();
            }
        }
    }

    render() {

        return (
            <View style={styles.mainContainer}>
                <Header title={'PEDIDOS DE DOAÇÃO'}/>
                <SearchBar onClear={ () => { this.searchBar('') } } onChangeText={ text => this.searchBar(text) } value={ this.state.searchValue } placeholder={'Digite algo para buscar...'} platform={'ios'}/>
                <Text style={{marginHorizontal: 8, color: 'grey'}}> {'Dúvidas Frequentes'} </Text>
                    <ScrollView>

                        { this.state.questions.map( (element, key) => {

                            return ( this.renderHelpCard(element, key) ) ;

                        }) }

                    </ScrollView>

                    <Overlay overlayStyle={{marginTop: 30, width: '94%', height: 'auto'}} isVisible={ this.state.showModal } onBackdropPress={() => this.setState({ showModal: false }) }>
                        <View>
                            <Text style={{ fontWeight: 'bold', fontSize: 15, paddingBottom: 12 }}>{ this.getTitle() }</Text>
                            <Text style={{ flexWrap: 'wrap', fontSize: 15, paddingBottom: 12, textAlign: 'justify' }}>{ this.getBody() }</Text>
                            <Button onPress={ () => { this.setState({ showModal: false }) } } buttonStyle={{ justifyContent: 'center', backgroundColor: '#ff4949' }} titleStyle={{ fontWeight: 'bold' }} iconRight icon={ <Icon style={{ marginLeft: 10 }} name={'thumbs-up'} solid color={'white'} size={20}/> } title={'Entendi'} />
                        </View>
                    </Overlay>
            </View>
        );
    }
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
        backgroundColor: '#ededed',
    },
    cardContainer: {
        marginHorizontal: 8,
        borderRadius: 10,
        borderColor: '#F6F5F5',
        marginTop: 10
    },
    cardBodyContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        width: 310
    },
    questionText: {
        fontWeight: 'bold',
        paddingLeft: 8,
        flexWrap: 'wrap'
    }
})
