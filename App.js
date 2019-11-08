import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

import { createMaterialTopTabNavigator } from 'react-navigation';
import { createStackNavigator, createAppContainer, createSwitchNavigator } from 'react-navigation';

import LoginScreen from './src/views/LoginScreen';
import HomeScreen from './src/views/HomeScreen';
import ProfileScreen from './src/views/ProfileScreen';
import BloodRequestScreen from './src/views/BloodRequestScreen';
import DetailedRequestScreen from './src/views/DetailedRequestScreen';
import MapScreen from './src/views/MapScreen';
import HelpScreen from './src/views/HelpScreen';
import ConfigScreen from './src/views/ConfigScreen';
import UserDonationScreen from './src/views/UserDonationScreen';
import RegisterScreen from './src/views/RegisterScreen';

const tabNavigatorConfig = {

  initialRouteName: 'Home',
  tabBarPosition: 'bottom',
  tabBarOptions: {
    showIcon: true,
    upperCaseLabel: false,
    activeTintColor: '#ff4949',
    inactiveTintColor: 'grey',
    style: {
      backgroundColor: 'white',
    },
    tabStyle: {
      padding: 0,
      marginBottom: 12,
    },
    indicatorStyle: {
      opacity: 0
    },
  },
}

const TabNavigator = createMaterialTopTabNavigator({
  Config: {
    screen: ConfigScreen,
    navigationOptions: {
      title: 'Config.',
      tabBarIcon: ({ tintColor }) => ( <Icon solid name={'cog'} color={tintColor} size={17}/> )
    },
  },
  Profile: {
    screen: ProfileScreen,
    navigationOptions: {
      title: 'Perfil',
      tabBarIcon: ({ tintColor }) => ( <Icon solid name={'user'} color={tintColor} size={17}/> )
    },
  },
  Home: {
    screen: HomeScreen,
    navigationOptions: {
      title: 'Pedidos',
      tabBarIcon: ({ tintColor }) => ( <Icon name={'tint'} color={tintColor} size={17}/> )
    },
  },
  Map: {
    screen: MapScreen,
    navigationOptions: {
      title: 'Mapa',
      tabBarIcon: ({ tintColor }) => ( <Icon solid name={'map-marked-alt'} color={tintColor} size={17}/> )
    },
  },
  Help: {
    screen: HelpScreen,
    navigationOptions: {
      title: 'Ajuda',
      tabBarIcon: ({ tintColor }) => ( <Icon name={'book'} color={tintColor} size={17}/> )
    },
  },

}, tabNavigatorConfig);

const AppNavigator = createStackNavigator({
  Login: {
    screen: LoginScreen,
  },
  Register: {
    screen: RegisterScreen,
    navigationOptions: {
      header: null
    }
  },
  BloodRequest: {
    screen: BloodRequestScreen,
    navigationOptions: {
      header: null
    }
  },
  Home: {
    screen: TabNavigator,
    navigationOptions: {
      header: null,
      gesturesEnabled: false
    }
  },
  DetailedRequest: {
    screen: DetailedRequestScreen,
    navigationOptions: {
      header: null,
    }
  },
  UserDonations: {
    screen: UserDonationScreen,
    navigationOptions: {
      header: null,
    }
  }
});

export default createAppContainer(AppNavigator);
