import {
  StyleSheet,
  Text,
  View,
  Appearance,
  FlatList,
  TouchableOpacity,
  Image,
  Pressable,
} from "react-native";
import { useEffect, useState } from "react";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

function HomeScreen() {
  const navigation = useNavigation();

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
          newCountdowns.push({
            calculated: seconds,
            countdown: countdowns[i].countdownDate,
          });
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
          style={{
            height: "100%",
          }}
          data={calculatedCountdowns}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                navigation.navigate("FullScreenCountdown", {
                  countdownDate: item.countdown,
                })
              }
            >
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 30,
                  backgroundColor: "lightgreen",
                  margin: 10,
                  borderRadius: 10,
                }}
              >
                {item.calculated}
              </Text>
            </Pressable>
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

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          // Go to CitiesScreen
          navigation.navigate("Cities");
        }}
        style={{
          position: "absolute",
          width: 50,
          height: 50,
          alignItems: "center",
          justifyContent: "center",
          right: 10,
          top: 100,
        }}
      >
        <Image
          // FAB using TouchableOpacity with an image
          // For online image
          source={{
            uri: "https://cdn1.iconfinder.com/data/icons/landscape-v-2/512/Landscape_Circle_2_512px_00043-512.png",
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

function CitiesScreen() {
  const [cities, setCities] = useState([]);

  useEffect(() => {
    fetch("https://avancera.app/cities")
      .then((response) => response.json())
      .then((json) => setCities(json));
  }, []);

  return (
    <View>
      <FlatList
        style={{
          height: "100%",
        }}
        data={cities}
        renderItem={({ item }) => (
          <Text
            style={{
              textAlign: "center",
              fontSize: 30,
              backgroundColor: "pink",
              margin: 10,
              borderRadius: 10,
            }}
          >
            {item.name}
          </Text>
        )}
      />
    </View>
  );
}

function FullScreenCountdown({ route }) {
  const navigation = useNavigation();

  const { countdownDate } = route.params;

  // Convert countdownDate to a Date object
  const countdownDateObject = new Date(parseInt(countdownDate));

  const [calculatedCountdown, setCalculatedCountdown] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = countdownDateObject - now;
      const seconds = diff / 1000;
      const minutes = seconds / 60;
      const hours = minutes / 60;
      setCalculatedCountdown({
        hours: hours.toFixed(2),
        minutes: minutes.toFixed(2),
        seconds: seconds.toFixed(2),
      });
      if (seconds < 0) {
        navigation.navigate("Home");
      }
    }, 10);
    return () => clearInterval(interval);
  }, [countdownDateObject]);

  return (
    <View>
      <Text
        style={{
          textAlign: "center",
          fontSize: 100,
          fontVariant: ["tabular-nums"],
          backgroundColor: "lightgreen",
        }}
      >
        {countdownDateObject.toLocaleTimeString()}
      </Text>
      <Text
        style={{
          textAlign: "center",
          fontSize: 50,
          fontVariant: ["tabular-nums"],
          marginBottom: 20,
        }}
      >
        {calculatedCountdown.hours + " in hours"}
      </Text>
      <Text
        style={{
          textAlign: "center",
          fontSize: 50,
          fontVariant: ["tabular-nums"],
          marginBottom: 20,
        }}
      >
        {calculatedCountdown.minutes + " in minutes"}
      </Text>
      <Text
        style={{
          textAlign: "center",
          fontSize: 50,
          fontVariant: ["tabular-nums"],
          marginBottom: 20,
        }}
      >
        {calculatedCountdown.seconds + " in seconds"}
      </Text>
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
          <Stack.Screen name="Cities" component={CitiesScreen} />
          <Stack.Screen
            name="FullScreenCountdown"
            component={FullScreenCountdown}
            // Param with the time to countdown to
            options={({ route }) => ({
              countdownDate: route.params.countdownDate,
            })}
          />
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
