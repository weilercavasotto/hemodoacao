import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    Linking, TouchableOpacity,
} from 'react-native';

import { NavigationEvents } from "react-navigation";

import Geolocation from '@react-native-community/geolocation';

import Icon from 'react-native-vector-icons/FontAwesome5';

import Header from '../components/Header';

import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import MediaHelper from '../helpers/MediaHelper';

export default class MapScreen extends React.Component {

    state = {

        canRenderMap: false,
        region: defaultRegion,
        markers: null,
        contextMenu: {
            show: false,
            phoneNumber: '',
            website: '',
            route: '',
        }
    }

    async getBloodMarkers() {

        try {

            let queryString = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?key='+API_KEY+'&keyword='+SEARCH_PARAMETER+'&fields='+FIELDS+'&language='+LANGUAGE+'&location='+this.state.region.latitude+','+this.state.region.longitude+'&radius=50000';
            let apiCall = await fetch(queryString);

            apiCall.json().then((response) => {

                if (response.results) {

                    let markers = [];

                    response.results.map(async (element, key) => {

                        if (element.place_id) {

                            let details = await this.getMarkerDetails(element.place_id);
                            element.details = details.result;
                        }

                        markers.push(element);
                    });

                    this.setState({ markers: markers });
                }

            });

        } catch (error) {

        }
    }

    async getMarkerDetails(markerId) {

        if (markerId) {

            let url = 'https://maps.googleapis.com/maps/api/place/details/json?key='+API_KEY+'&placeid='+markerId+'&fields=formatted_phone_number,website'
            let apiCall = await fetch(url);

            return await apiCall.json();
        }
    }

    async getCurrentLocation() {

        Geolocation.getCurrentPosition(
            (position) => {

                let region = {
                        latitude: parseFloat(position.coords.latitude),
                        longitude: parseFloat(position.coords.longitude),
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421
                };

                this.setState({
                    region: region
                });

                this.getBloodMarkers();
            },
            error => console.log(error),
            {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 1000
            }
        );
    }

    renderMarkerToolTip(marker) {

        return (

            <Callout>
                <View style={styles.markerTooltipContainer}>

                    <Text style={styles.markerTooltipText}> { marker.name } </Text>
                    <Text> { marker.vicinity } </Text>

                    <Text> { marker.details.formatted_phone_number } </Text>

                    { marker.opening_hours && marker.opening_hours.open_now ? <Text style={styles.openText}> Aberto </Text> : <Text style={styles.closedText}> Fechado </Text> }

                </View>
            </Callout>
        );
    }

    constructor(props) {

        super(props);
    }

    componentDidMount() {

        this.getCurrentLocation();
    }

    showActionMenu(data) {
        let oldState = this.state.contextMenu.show;
        this.setState({ contextMenu: { show: !oldState, phoneNumber: data.details.formatted_phone_number, website: data.details.website, route: { latitude: data.geometry.location.lat, longitude: data.geometry.location.lng } } })
    }

    traceRoute() {

        if (this.state.region.latitude && this.state.region.longitude && this.state.contextMenu.route.latitude && this.state.contextMenu.route.longitude) {

            const mode = 'driving'; // 'walking';
            const origin = this.state.region.latitude + ',' + this.state.region.longitude;
            const destination = this.state.contextMenu.route.latitude + ',' + this.state.contextMenu.route.longitude;
            const APIKEY = 'AIzaSyAHFNbd3p3IJiyofotBju__XMEJdfGzZiE';
            const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${APIKEY}&mode=${mode}`;

            fetch(url)
                .then(response => response.json())
                .then(responseJson => {
                    console.log(responseJson);
                    if (responseJson.routes.length) {
                        this.setState({
                            contextMenu: { routeCords: this.decode(responseJson.routes[0].overview_polyline.points) } // definition below
                        });

                        _mapView.animateToRegion({
                            latitude: this.state.region.latitude,
                            longitude: this.state.region.longitude,
                            latitudeDelta: 0.0122,
                            longitudeDelta: 0.0121
                        }, 1000)
                    }
                }).catch(e => {console.warn(e)});
        }
    }

    decode(t, e) {
        for (var n, o, u = 0, l = 0, r = 0, d = [], h = 0, i = 0, a = null, c = Math.pow(10, e || 5); u < t.length;) {
            a = null, h = 0, i = 0;
            do a = t.charCodeAt(u++) - 63, i |= (31 & a) << h, h += 5; while (a >= 32);
            n = 1 & i ? ~(i >> 1) : i >> 1, h = i = 0;
            do a = t.charCodeAt(u++) - 63, i |= (31 & a) << h, h += 5; while (a >= 32);
            o = 1 & i ? ~(i >> 1) : i >> 1, l += n, r += o, d.push([l / c, r / c])
        }
        return d = d.map(function(t) {
            return {
                latitude: t[0],
                longitude: t[1]
            }
        })
    }

    renderContextMenu() {

        return (
            <View style={{
                alignItems:'center',
                justifyContent:'center',
                width:'60%',
                position: 'absolute',
                bottom: 20,
                alignSelf: 'center',
                height:70,
                backgroundColor:'#fff',
                borderRadius:8,
                borderColor: '#ededed',
                borderWidth: 1,
            }}>

                <View style={{ flexDirection: 'row', flex: 1, paddingVertical: 5, justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => MediaHelper.callNumber(this.state.contextMenu.phoneNumber) } style={{ width: 40, height: 40, borderRadius: 40 / 2, backgroundColor: '#ff4949', justifyContent: 'center', alignItems: 'center' }}>
                        <Icon color={'white'} name={'phone'} alt size={20}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => MediaHelper.openUrl(this.state.contextMenu.website) } style={{ marginLeft: 10, width: 40, height: 40, borderRadius: 40 / 2, backgroundColor: '#ff4949', justifyContent: 'center', alignItems: 'center' }}>
                        <Icon color={'white'} name={'globe'} solid size={20}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { this.traceRoute() }} style={{ marginLeft: 10, width: 40, height: 40, borderRadius: 40 / 2, backgroundColor: '#ff4949', justifyContent: 'center', alignItems: 'center' }}>
                        <Icon color={'white'} name={'walking'} solid size={20}/>
                    </TouchableOpacity>
                </View>

            </View>
        );
    }

    render() {

      return (
          <View style={{flex: 1}} keyboardShouldPersistTaps={'always'}>
          <Header title={'Mapa de Hemocentros'}/>

            <NavigationEvents
                onDidBlur={payload => {
                    this.setState({ canRenderMap: false })
                }}
                onDidFocus={payload => {
                    this.setState({ canRenderMap: true })
                }}
            />

            { this.state.canRenderMap  ?

            <MapView
                loadingEnabled={ true }
                provider={PROVIDER_GOOGLE}
                style={{flex: 1}}
                showsUserLocation={true}
                followsUserLocation={ true }
                zoomControlEnabled={true}
                region={ (this.state.region) }
                pitchEnabled={true}
                ref = {(mapView) => { _mapView = mapView; }}>

            { this.state.markers ? this.state.markers.map( (marker, key) => (

                <Marker
                    key={ key }
                    coordinate={{ latitude: marker.geometry.location.lat, longitude: marker.geometry.location.lng }}
                    title={marker.name}
                    onPress={ () => { this.showActionMenu(marker) } }    >

                     <View>
                        <Icon name={'tint'} color={'#ff4949'} size={30}/>
                    </View>

                    { this.renderMarkerToolTip(marker) }

                </Marker>

            )) : null }

                { this.state.contextMenu.routeCords ?

                    <MapView.Polyline
                        coordinates={this.state.contextMenu.routeCords}
                        strokeWidth={4}
                        strokeColor={'#ff4949'}
                    /> : null }

            </MapView> : null }

              { this.state.contextMenu.show ? this.renderContextMenu() : null }

              <GooglePlacesAutocomplete
                  placeholder='Procure uma localização...'
                  minLength={2}
                  autoFocus={false}
                  returnKeyType={'default'}
                  fetchDetails={true}
                  nearbyPlacesAPI='GooglePlacesSearch'
                  styles={ googleAutoCompleteStyle }
                  query= {{ key: 'AIzaSyAHFNbd3p3IJiyofotBju__XMEJdfGzZiE', language: 'pt-BR' }}
                  listViewDisplayed={false}
                  onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true

                      _mapView.animateToRegion({
                          latitude: details.geometry.location.lat,
                          longitude: details.geometry.location.lng,
                          latitudeDelta: 0.0122,
                          longitudeDelta: 0.0121
                      }, 1000)
                  }}
              />

          </View>
      )
    }
}

const API_KEY = 'AIzaSyAHFNbd3p3IJiyofotBju__XMEJdfGzZiE';
const SEARCH_PARAMETER = 'Doar Sangue';
const FIELDS = '';
const LANGUAGE = 'pt-BR';

const defaultRegion = {
    latitude: -23.575035,
    longitude: -46.617483,
    latitudeDelta: 5,
    longitudeDelta: 5
}

const styles = StyleSheet.create({

    markerTooltipContainer: {
        height: 'auto',
        width: 200,
    },
    markerTooltipText: {
        fontWeight: 'bold'
    },
    closedText: {
        color: 'red'
    },
    openText: {
        color: 'green'
    }
});

const googleAutoCompleteStyle = StyleSheet.create({
    container: {
        position: 'absolute',
        width: '100%',
        top: 80
    },
    textInputContainer: {
        backgroundColor: 'rgba(0,0,0,0)',
        borderTopWidth: 0,
        borderBottomWidth:0,
        paddingHorizontal: 10,
    },
    textInput: {
        marginLeft: 0,
        marginRight: 0,
        height: 38,
        color: '#5d5d5d',
        fontSize: 16
    },
    predefinedPlacesDescription: {
        color: '#1faadb'
    },
    row: {
        backgroundColor: 'white'
    }
});
