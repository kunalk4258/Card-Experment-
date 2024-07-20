import React, { useEffect } from 'react';
import { View, SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import analytics from '@react-native-firebase/analytics';
import branch, { BranchParams } from 'react-native-branch';
import FlatCards from './components/FlatCards';
import ElevatedCards from './components/ElevatedCards';
import FancyCards from './components/FancyCards';
import ActionCards from './components/ActionCards';
import ContactList from './components/ContactList';
import NewScreen from './screen/Profile';

type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface HomeProps {
  navigation: HomeScreenNavigationProp;
}

const Home: React.FC<HomeProps> = ({ navigation }) => {
  useEffect(() => {
    const logScreenView = async () => {
      await analytics().logScreenView({
        screen_name: 'HomeScreen',
        screen_class: 'App',
      });
    };
    logScreenView();
  }, []);

  const handlePress = async (label: string) => {
    await analytics().logEvent('card_navigation', {
      from_screen: 'HomeScreen',
      to_screen: 'Profile',
      label: label,
    });
    navigation.navigate('Profile');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <ScrollView>
          <FlatCards />
          <ElevatedCards onPress={handlePress} />
          <FancyCards />
          <ActionCards />
          <ContactList />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const Profile: React.FC = () => {
  useEffect(() => {
    const logScreenView = async () => {
      await analytics().logScreenView({
        screen_name: 'ProfileScreen',
        screen_class: 'Profile',
      });
    };
    logScreenView();
  }, []);

  return (
    <View>
      <Text>Profile Screen</Text>
    </View>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    const initBranch = async () => {
      const unsubscribe = branch.subscribe(async ({ error, params }) => {
        if (error) {
          console.error('Error from Branch: ' + error);
          return;
        }
        console.log('Branch params: ', params);

        // Ensure params are defined
        if (params) {
          const { utm_campaign, utm_medium, utm_source } = params as BranchParams;

          // Additional logging to debug UTM parameter presence
          console.log('UTM Campaign:', utm_campaign);
          console.log('UTM Medium:', utm_medium);
          console.log('UTM Source:', utm_source);

          if (utm_campaign && utm_medium && utm_source) {
            console.log('Campaign details logged successfully:', { utm_campaign, utm_medium, utm_source });

            // Log event to Firebase Analytics
            await analytics().logEvent('branch_deep_link', {
              utm_campaign,
              utm_medium,
              utm_source,
            });
          } else {
            console.log('No UTM parameters found. Logging as direct source.');

            // Log event as direct source to Firebase Analytics
            await analytics().logEvent('branch_deep_link', {
              utm_campaign: 'direct',
              utm_medium: 'direct',
              utm_source: 'direct',
            });
          }
        } else {
          console.error('Branch params are undefined.');
        }
      });

      return () => {
        unsubscribe();
      };
    };

    initBranch();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Profile" component={Profile} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black', // Set the background color to black
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;