# <img src="/readme/masterchief-circle.png" width="32"> Halo: MCC Stat Notifier
[<img src="https://deploy.stdlib.com/static/images/deploy.svg?" width="192">](https://deploy.stdlib.com/)

✨ Welcome to the **Halo: Master Chief Collection Stat Notifier**!

This project uses publicly-available Halo: MCC game info and player stats to send
SMS messages to your squad (friends) when you start playing Halo: Reach, tells
them your stats, and then updates you on your stats after every game.

In order to get this running, we'll be using two tools provided by
[**Standard Library**](https://stdlib.com/), an API-hosting platform that supports event triggers.
All of the code here is fully configurable and can also be downloaded and run locally.

- [**Autocode**](https://autocode.com), an in-browser code editor for APIs
- [**Halo: Master Chief Collection API**](https://stdlib.com/@halo/lib/mcc), an API which you can use separately

<img src="/readme/halo-stat-sms.jpg" width="256">

<img src="/readme/squad.jpg" width="256">

## How does the Stat Notifier work?

The Stat Notifier code can be found in `functions/events/scheduler/minutely.js`,
which will automatically be deployed as an API endpoint that gets triggered every
minute via [Standard Library](https://stdlib.com/).

1. Execute an API every minute with the Scheduler: Minutely event that...
2. Uses the [`halo.mcc.games.latest`](https://stdlib.com/@halo/lib/mcc/#games-latest)
   API to fetch your most recent game data.
3. Checks to see if you've reported on this data yet using the
   [`utils.kv.get`](https://stdlib.com/@utils/lib/kv/#get) API, which is a
   key-value store specific to your Standard Library account.
4. **If it's a new game**, store the game time using [`utils.kv.set`](https://stdlib.com/@utils/lib/kv/#set) for next time.
5. **If you haven't played in a while**, prepare a group SMS to tell all your friends you're in a new session.
6. **Otherwise**, just prepare a message to you to tell you what your stats are.
7. **Finally**, send out the SMS using [`utils.sms`](https://stdlib.com/@utils/lib/sms/) to either you or your squad.

## Installation

Installation is simple. You can click on the button below to instantly open this
project in Autocode.

[<img src="https://deploy.stdlib.com/static/images/deploy.svg?" width="192">](https://deploy.stdlib.com/)

From here, you'll be prompted with **Environment Variables**. You'll want to use the following:

- **`GAMERTAG`**: Your XBL Gamertag that you want to track. e.g. `Xx MyGamertag xX`
- **`PHONE_NUMBERS`**: A comma-separated list of phone numbers to send SMS to. **The first one should be yours**,
  the rest can be your squad. e.g. `14165550000,16475551337`. Your squad will only be notified upon new sessions.

Next, just name your project and hit **Start API Project from GitHub**.

<img src="/readme/deploy-from-github.png" width="384">


**NOTE:** Your project **IS NOT YET DEPLOYED**. You can test it by navigating to `functions/events/scheduler/minutely.js`
  and clicking **Run Code**.

<img src="/readme/run-code.png" width="384">

You can Deploy at any time from the **Deploy** button in the bottom left corner of Autocode's IDE:

<img src="/readme/deploy.png" width="384">

## How Can I Make Changes?

You can make changes to your project any time by visiting [autocode.com](https://autocode.com/).

The code for the Stat Notifier itself is pretty simple, coming in at well under 100 lines of code.
If you open up `functions/events/scheduler/minutely.js` in Autocode, you can see both comments
and annotations for certain lines of code and what they do.

A few things to note...

```javascript
console.log(`Retrieving latest Halo: Reach game...`);
result.halo.gameHistory = await lib.halo.mcc['@0.0.10'].games.latest({
  gamertag: GAMERTAG,
  game: 'Halo: Reach',
  gameType: 'All'
});
```

This is the main code that talks to the [Halo: Master Chief Collection API](https://stdlib.com/@halo/lib/mcc).
You can play around with different endpoints by visiting [Halo: MCC API documentation](https://stdlib.com/@halo/lib/mcc).

```javascript
console.log(`Texting me my game results...`);
await Promise.all(phoneNumbers.map(phone => {
  return lib.utils.sms['@1.0.11']({
    to: phone,
    body: `${newSessionMessage}` +
      `${result.halo.gameHistory.games[0].won ? '🎉' : '😵'} ${result.halo.gameHistory.gamertag} just ` +
      `${result.halo.gameHistory.games[0].won ? 'won' : 'lost'} a ` +
      `${result.halo.gameHistory.games[0].gameVariant} game in Halo: Reach.\n\n` +
      `💥 Kills: ${result.halo.gameHistory.games[0].kills}\n` +
      `☠️ Deaths: ${result.halo.gameHistory.games[0].deaths}\n` +
      `🔫 KD: ${result.halo.gameHistory.games[0].killDeathRatio.toFixed(2)}\n\n` +
      `🕒 ${result.halo.gameHistory.games[0].playedAtRecency}` +
      `${newSessionFooter}`
  });
}));
```

The above code is what generates your message and sends text messages out. The `phoneNumbers` variable
is derived from `process.env.PHONE_NUMBERS`, you can change your Environment variables any time
by opening `env.json` in Autocode.

## Thank You!

From the team at [Standard Library](https://stdlib.com) / [Autocode](https://autocode.com) to you,
we thank you for checking out this project. 🙏

If you're excited about what you can build with Halo APIs or anything else, please let us know! You
can drop us a line in a few ways;

- On [stdlib.com](https://stdlib.com), click the **Community -> Slack** tab at the top to request an
  invitation to our Slack community, where we can help at any time.
- Reach (no pun intended!) out on Twitter, [@StandardLibrary](https://twitter.com/StandardLibrary)
- 👋 I'm Keith and you can hit me up on Twitter at [@keithwhor](https://twitter.com/keithwhor).
  I'm a long-time Halo fan and had fun building this!

&copy; 2020 Standard Library (Polybit Inc.)
