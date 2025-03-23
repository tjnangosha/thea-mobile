const IS_PREVIEW = process.env.APP_VARIANT === 'preview'

export default {
  name: IS_PREVIEW ? "THEAMobile(Preview)" : "THEAMobile",
  slug: "THEAMobile",
  version: "1.0.0",
  orientation: "portrait",
  icon: IS_PREVIEW ? "./assets/images/icon_thea_mobile_dev.png" : "./assets/images/icon_thea_mobile.png",
  scheme: "theamobile",
  userInterfaceStyle: "automatic",
  ios: {
    supportsTablet: true,
  },
  android: {
    permissions: [
      "android.permission.ACCESS_COARSE_LOCATION",
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.FOREGROUND_SERVICE",
      "android.permission.FOREGROUND_SERVICE_LOCATION",
      "android.permission.POST_NOTIFICATIONS",
      "android.permission.FOREGROUND_SERVICE_DATA_SYNC"
    ],
    package: IS_PREVIEW ? "com.bodastage.thea.preview" : "com.bodastage.thea",
  },
  ios: {
    "bundleIdentifier": IS_PREVIEW ? "com.bodastage.thea.preview" : "com.bodastage.thea",
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    // SDK 52 has a tonne of issues/breaking changes which include(but are not limited to) issues 
    // with the splash screen on Android 12+. It does not take a lot of work to find multiple issues on the expo github repo
    // In the meantime, i will use the default screen provided by expo/android. It's not like a splash
    // screen is a must have feature/core functionality anwyay.
    // TODO; fix when the expo guys get their stuff in order
    // [
    //   "expo-splash-screen",
    //   {
    //     splash: {
    //       image: IS_PREVIEW ? "./assets/images/icon_thea_mobile_dev.png" : "./assets/images/icon_thea_mobile.png",
    //       imageWidth: 200,
    //       resizeMode: "contain",
    //       backgroundColor: "#ffffff"
    //     }
    //   }
    // ],

    
    "expo-router",
    "expo-background-task",
    [
      "expo-location",
      {
        isAndroidForegroundServiceEnabled: true,
      },
    ],
    "./plugins/withAndroidForegroundService.js",
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: "adf6cd09-c75e-4178-94d8-1e9e9d04bba9",
    },
  },
};
