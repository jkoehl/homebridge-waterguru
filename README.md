Under construction...I just got my Waterguru so just now figuring out how best to integrate into HomeBridge

# homebridge-waterguru

waterguru plug-in for [Homebridge](https://github.com/nfarina/homebridge) using their unofficial API.

## Features

This plugin currently supports the following devices and features:

- Multiple waterbodies
- TBD...

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

## Support

If you have general questions about usage, please use the [Discussions](https://github.com/jkoehl/homebridge-waterguru/discussions) tab.

## Contact

You can find me on Twitter [@jkoehl](https://twitter.com/jkoehl)
