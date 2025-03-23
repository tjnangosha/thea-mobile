import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { RealmProvider } from '@realm/react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { StrictMode, useEffect, useRef, useState } from 'react';
import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';

import { RealmService } from '@/store';
import { useColorScheme } from '@/hooks/useColorScheme';
import AuthGuard from '@/components/AuthGuard';
import { LocationRecord } from "@/locations";
import { locationsApi } from "@/services/api";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();


const startSync = async () => {
    console.log(`[INFO][${new Date().toISOString()}] Starting sync`);
    const locations = RealmService.getUnsyncedLocations()

    if(locations.length > 0){
      const locationRecords: LocationRecord[] = []

      locations.forEach(async location => {
        const { latitude, longitude , subject} = location
        const locationRecord = { latitude, longitude, subject }
        locationRecords.push(locationRecord as LocationRecord)
      })

      await locationsApi.saveLocations(locationRecords).then(() => {
        RealmService.markLocationsAsSynced(locations)
      }).catch((error) => {
        console.error("Error saving locations online - will retry job at next interval");
      })
    } else {
      await unregisterBackgroundTaskAsync()
    }
}

const startCleanup = () => {
  try {
    console.log(`[INFO][${new Date().toISOString()}] Starting cleanup`);
    RealmService.clearSyncedLocations()
  } catch (error) {}
}

const BACKGROUND_TASK_IDENTIFIER = 'locations-sync';
const SYNC_INTERVAL =  15 * 60 * 1000  // 5 minute(s)

TaskManager.defineTask(BACKGROUND_TASK_IDENTIFIER, async () => {
  try {
    await startSync()
    startCleanup()
  } catch (error) {
    console.error('Failed to define the background task:', error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }

  return BackgroundTask.BackgroundTaskResult.Success;
});

async function registerBackgroundTaskAsync() {
  return BackgroundTask.registerTaskAsync(BACKGROUND_TASK_IDENTIFIER, {
    minimumInterval: SYNC_INTERVAL,
  });
}

function unregisterBackgroundTaskAsync() {
  return BackgroundTask.unregisterTaskAsync(BACKGROUND_TASK_IDENTIFIER);
}


export default function RootLayout() {
  const colorScheme = useColorScheme();
  const realmInitDone = useRef(false);
  const [forceRenderOnRealmInit, setForceRenderOnRealmInit] = useState(false);

  const realmInit = () => {
    if(RealmService.isMigrationNeeded()){
      RealmService.migrate()
    }
  }

  useEffect(() => {
    if(!realmInitDone.current){
      realmInit()
    }
    
    realmInitDone.current = true;
    setForceRenderOnRealmInit(!forceRenderOnRealmInit);

    (async () => { await registerBackgroundTaskAsync(); })();
  }, []);

  return (
    <StrictMode>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {
          realmInitDone.current && (
            <RealmProvider realm={RealmService.getInstance()} >
                <AuthGuard>
                  <Stack screenOptions={{headerShown: false}}></Stack>
                  <Toast />
                </AuthGuard>
            </RealmProvider>
          )
        }
      </ThemeProvider>
    </StrictMode>
  );
}
