# homebridge-waterguru

Waterguru plug-in for [Homebridge](https://github.com/nfarina/homebridge) using Waterguru's unofficial API.

The [Waterguru](https://waterguru.com) is a device that sits in your pool and monitors a pool's chlorine, Ph, and temperature. Its pretty nifty but doesn't currently integrate with HomeKit. This plugin allows you to see the waterguru information within HomeKit and therefore also using Siri.

My main use case was I wanted to be able ask Siri for the current temperature of the pool.

## Features

This plugin currently supports the following devices and features:

- Current Temperture: The waterguru updates the temperature about every 30 minutes

Half-baked features:

- Custom attributes for Free Chlorine and Ph on the temperature sensor accessory

## Installation

### waterguru Parameters

| Option             | Required | Explanation |
| ------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Waterguru Username`   | true   | Username used to login to the Waterguru app (usually your email address) |
| `Waterguru Password` | true   | Username used to login to the Waterguru app |

### Easiest Configuration (Please just do this one)

For the best experience setting up this plugin, please use [homebridge-config-ui-x](https://www.npmjs.com/package/homebridge-config-ui-x).

### Basic Configuration

Assuming a global installation of `homebridge`, install the plugin:

`npm i -g homebridge-waterguru`

Add the `waterguru` platform in your homebridge `config.json` file:

```json
"platforms": [
    {
        "platform": "Waterguru",
        "wg-username": "fff",
        "wg-password": "fff",
    }
],
```

## Technical Implementation Details
I used the Amazon Amplify framework to make it much easier to authenticate to the Waterguru API. They are using AWS Cognitio to authenticate users and then tokens from Cognito to make calls to a Lambda. Doing that dance manually is a pain but with Amplify it was super easy.

I used Charles proxy to see what the waterguru API delivered as payload. The API has a ton of really interesting info which drives their mobile app. Their mobile app is actually pretty great with lots of trends views and such. I am simply pulling the latest values since that is about all HomeKit is good at doing.

The HomeKit platform doesn't really support the concept of a water sensor for chemistry so I ended up trying to add custom characteristics to a temperature sensor accessory. But really I would probably use their app anyway to dig deeper into the water details and trends.

I did not pursue adding functionality to initiate a water test. Most people probably just let it do its daily test since the test cartridges are expensive and I wouldn't want to burn through someones tests with a mistake in my plug-in.

## Support

If you have general questions about usage, please use the [Discussions](https://github.com/jkoehl/homebridge-waterguru/discussions) tab.

## Contact

You can find me on Twitter [@jkoehl](https://twitter.com/jkoehl)
