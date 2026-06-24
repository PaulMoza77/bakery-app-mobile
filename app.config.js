const path = require('path')
const appJson = require('./app.json')

const images = (...parts) => path.join(__dirname, 'assets', 'images', ...parts)

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  expo: {
    ...appJson.expo,
    icon: images('icon.png'),
    android: {
      ...appJson.expo.android,
      adaptiveIcon: {
        ...appJson.expo.android.adaptiveIcon,
        foregroundImage: images('android-icon-foreground.png'),
        backgroundImage: images('android-icon-background.png'),
        monochromeImage: images('android-icon-monochrome.png'),
      },
    },
    web: {
      ...appJson.expo.web,
      favicon: images('favicon.png'),
    },
    plugins: appJson.expo.plugins.map((plugin) => {
      if (
        Array.isArray(plugin) &&
        plugin[0] === 'expo-splash-screen' &&
        plugin[1]?.image
      ) {
        return [
          plugin[0],
          {
            ...plugin[1],
            image: images('splash-icon.png'),
          },
        ]
      }
      return plugin
    }),
  },
}
