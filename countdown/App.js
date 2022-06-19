import {
  StyleSheet,
  Text,
  View,
  Appearance,
  FlatList,
  TouchableOpacity,
  Image,
  Pressable,
  RefreshControl,
  StatusBar,
  Switch,
  ImageBackground,
  Alert,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

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
        const seconds = diff / 1000;
        const minutes = seconds / 60;

        if (seconds > 0) {
          newCountdowns.push({
            calculated: minutes.toFixed(2),
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
    date.setMilliseconds(0);

    if (date.getTime() < new Date().getTime()) {
      date.setHours(date.getHours() + 24);
    }

    // Check if the date is already in the list
    let found = false;
    for (let i = 0; i < countdowns.length; i++) {
      if (countdowns[i].countdownDate === date.getTime()) {
        found = true;
      }
    }

    if (!found) {
      const tempCountdowns = [
        ...countdowns,
        {
          countdownDate: date.getTime(),
        },
      ];

      addCountdown(tempCountdowns);

      try {
        await AsyncStorage.setItem(
          "countdowns",
          JSON.stringify(tempCountdowns)
        );
      } catch (e) {
        console.log(e);
      }

      hideDatePicker();
    } else {
      Alert.alert("Date already exists", "Please choose another date");
      setDatePickerVisibility(false);
    }
  };

  return (
    <View>
      <FlatList
        style={{
          height: "100%",
        }}
        data={calculatedCountdowns}
        ListEmptyComponent={() => (
          <Text
            style={{
              textAlign: "center",
              fontSize: 30,
              backgroundColor: "pink",
              margin: 10,
              borderRadius: 10,
            }}
          >
            {"No Countdowns,\nadd one by clicking\nthe plus button"}
          </Text>
        )}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate("FullScreenCountdown", {
                countdownDate: item.countdown,
              })
            }
            style={({ pressed }) => [
              {
                transform: [
                  {
                    scale: pressed ? 0.95 : 1,
                  },
                ],
              },
            ]}
            onLongPress={() => {
              const tempCountdowns = [...countdowns];
              const index = tempCountdowns.findIndex(
                (countdown) => countdown.countdownDate === item.countdown
              );
              tempCountdowns.splice(index, 1);
              Alert.alert(
                "Delete countdown",
                "Are you sure you want to delete this countdown?",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                      addCountdown(tempCountdowns);
                      try {
                        await AsyncStorage.setItem(
                          "countdowns",
                          JSON.stringify(tempCountdowns)
                        );
                      } catch (e) {
                        console.log(e);
                      }
                    },
                  },
                ],
                { cancelable: true }
              );
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontSize: 30,
                backgroundColor: "lightgreen",
                margin: 10,
                borderRadius: 10,
                fontVariant: ["tabular-nums"],
              }}
            >
              {item.calculated +
                "\nminutes until\n" +
                new Date(item.countdown).toLocaleTimeString()}
            </Text>
          </Pressable>
        )}
      />

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
  const [toggle, setToggle] = useState(false);

  useEffect(() => {
    fetch("https://avancera.app/cities")
      .then((response) => response.json())
      .then((json) => setCities(json));
  }, []);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    fetch("https://avancera.app/cities")
      .then((response) => response.json())
      .then((json) => setCities(json))
      .then(() => setRefreshing(false))
      .catch((error) => {
        console.log(error);
        setRefreshing(false);
      });
  }, []);

  return (
    <View>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <ImageBackground
        source={{
          uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Gamla_staden%2C_Malm%C3%B6%2C_Sweden_-_panoramio_(50).jpg/1200px-Gamla_staden%2C_Malm%C3%B6%2C_Sweden_-_panoramio_(50).jpg",
        }}
      >
        <SafeAreaView>
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
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListFooterComponent={() => (
              <Switch
                onValueChange={(value) => {
                  alert(value);
                  setToggle(value);
                }}
                value={toggle}
                ios_backgroundColor="pink"
              />
            )}
          />
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

function FullScreenCountdown({ route }) {
  const navigation = useNavigation();

  const { countdownDate } = route.params;

  // Convert countdownDate to a Date object
  const countdownDateObject = new Date(parseInt(countdownDate));

  const [calculatedCountdown, setCalculatedCountdown] = useState(0);

  // useKeepAwake();

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
