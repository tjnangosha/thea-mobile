import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import * as Location from "expo-location";
// import VIForegroundService from "@voximplant/react-native-foreground-service";

import { useQuery } from "@realm/react";
import { RealmService } from "@/store";

export default function MainScreen() {
  const [mainButtonText, setButtonText] = useState("Start tracking!");
  const [buttonColor, setButtonColor] = useState("#34eb5b");
  const [isTrackingButtonClicked, setIsTrackingButtonCliked] = useState(false);
  const [locationSubscription, setLocationSubscription] = useState<null | Location.LocationSubscription>(null);

  const subject: any = useQuery('Subject')[0]
  const subjectId = subject?.subjectId
    
  const CHANNEL_ID = "ForegroundServiceChannel";
  const SAMPLING_INTERVAL    =  0.25 * 60 * 1000  // 15 second(s)

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log(`[INFO][${new Date().toISOString()}] Permission to access location was denied`);
        return;
      }
    })();

    return () => {
      stopTracking();
      setButtonText("Start tracking!");
      setButtonColor("#34eb5b");
    };
  }, []);

  const handleTrackingButtonClicked = () => {
    setIsTrackingButtonCliked(!isTrackingButtonClicked);
  };

  const startTracking = async () => {
    console.log(`[INFO][${new Date().toISOString()}] Starting tracking`);

    const channelConfig = {
      id: CHANNEL_ID,
      name: "Location tracking",
      description: "Track locations",
      enableVibration: true,
      importance: 3
    };

    // await VIForegroundService.getInstance().createNotificationChannel(channelConfig);

    const notificationConfig = {
      channelId: CHANNEL_ID,
      id: 2210,
      title: "Tracking in progress",
      text: "",
      icon: "ic_launcher",
    };

    // await VIForegroundService.getInstance().startService(notificationConfig, 8)

    // VIForegroundService.getInstance().on("SIGNAL_LOCATION_TRACK_START", async () => {
    //   const subscription = await Location.watchPositionAsync(
    //     {
    //       accuracy: Location.Accuracy.BestForNavigation,
    //       timeInterval: SAMPLING_INTERVAL,
    //       distanceInterval: 5, // 5 metres
    //     },
    //     async (location) => {
    //       try {
    //         const { latitude, longitude } = location.coords;
    //         const locationRecord = {
    //           latitude: latitude.toFixed(6),
    //           longitude: longitude.toFixed(6),
    //           subject: subjectId as string,
    //           timestamp: new Date().toISOString(),
    //         };
  
    //         RealmService.saveLocationCoordinates(locationRecord)
    //         console.log(`[INFO][${new Date().toISOString()}] Location: ${latitude}, ${longitude}`);
    //       } catch (error: any) {
    //         console.error("Could not save location to local storage: ", error.message);
    //       }
    //     }
    //   );
  
    //   setLocationSubscription(subscription);
    // });

  };

  const stopTracking = async () => {
    console.log(`[INFO][${new Date().toISOString()}] Stopping tracking`);

    try {
      // await VIForegroundService.getInstance().stopService();
    } catch (error) {
      // console.error("Could not stop foreground service:  ", error);
    }

    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
  };

  useEffect(() => {
    if (isTrackingButtonClicked) {
      startTracking();
      setButtonText("Stop tracking!");
      setButtonColor("#eb4034");
    } else {
      stopTracking();
      setButtonText("Start tracking!");
      setButtonColor("#34eb5b");
    }
  }, [isTrackingButtonClicked]);


  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={{ ...styles.button, backgroundColor: buttonColor }}
        onPress={handleTrackingButtonClicked}
      >
        <Text style={styles.buttonText}>{mainButtonText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 20,
  },
});
