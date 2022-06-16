import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Appearance,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

function HomeScreen() {
  const [countdowns, addCountdown] = useState([]);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const [calculatedCountdowns, setCalculatedCountdowns] = useState([]);

  async function getCountdownsFromStorage() {
    try {
      const value = await AsyncStorage.getItem("countdowns");
      if (value !== null) {
        addCountdown(JSON.parse(value));
      }
    } catch (e) {
      console.log(e);
    }
  }
  useEffect(() => {
    getCountdownsFromStorage();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const newCountdowns = [];
      for (let i = 0; i < countdowns.length; i++) {
        const countdown = countdowns[i];
        const countdownDate = new Date(parseInt(countdown.countdownDate));
        const now = new Date();
        const diff = countdownDate - now;
        const seconds = Math.floor(diff / 1000);

        if (seconds > 0) {
          newCountdowns.push(seconds);
        }
      }
      setCalculatedCountdowns(newCountdowns);
    }, 10);
    return () => clearInterval(interval);
  }, [countdowns]);

  const clickHandler = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = async (date) => {
    date.setSeconds(0);
    const tempCountdowns = [
      ...countdowns,
      {
        countdownDate: date.getTime(),
      },
    ];

    addCountdown(tempCountdowns);

    try {
      await AsyncStorage.setItem("countdowns", JSON.stringify(tempCountdowns));
    } catch (e) {
      console.log(e);
    }

    hideDatePicker();
  };

  return (
    <View>
      {calculatedCountdowns.length > 0 && (
        <FlatList
          data={calculatedCountdowns}
          renderItem={({ item }) => (
            <Text
              style={{
                textAlign: "center",
                fontSize: 30,
                backgroundColor: "lightgreen",
                margin: 10,
                borderRadius: 10,
              }}
            >
              {item}
            </Text>
          )}
        />
      )}

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={clickHandler}
        style={styles.touchableOpacityStyle}
      >
        <Image
          // FAB using TouchableOpacity with an image
          // For online image
          source={{
            uri: "https://raw.githubusercontent.com/AboutReact/sampleresource/master/plus_icon.png",
          }}
          // For local image
          //source={require('./images/float-add-icon.png')}
          style={styles.floatingButtonStyle}
        />
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="time"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </View>
  );
}

const Stack = createNativeStackNavigator();

export default function App() {
  // Get the current theme
  const theme = Appearance.getColorScheme();
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#d3c832",
    alignItems: "center",
    justifyContent: "center",
  },
  floatingButtonStyle: {
    resizeMode: "contain",
    width: 50,
    height: 50,
  },
  touchableOpacityStyle: {
    position: "absolute",
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    right: 10,
    top: 10,
  },
});
