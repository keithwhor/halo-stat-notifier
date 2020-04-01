const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});
const PHONE_NUMBERS = (process.env.PHONE_NUMBERS || '').split(',');
const GAMERTAG = process.env.GAMERTAG;
const FORCE_MESSAGE = false; // Force a message. For debug only.

/**
* An HTTP endpoint that acts as a webhook for Scheduler minutely event
* @returns {object} result Your return value
*/
module.exports = async () => {

  if (!GAMERTAG) {
    throw new Error(`GAMERTAG not set. Please set in "env.json".`);
  } else if (!PHONE_NUMBERS) {
    throw new Error(`PHONE_NUMBERS not set. Please set in "env.json".`);
  }

  // Store API Responses
  const result = {halo: {}, utils: {}};

  console.log(`Retrieving latest Halo: Reach game...`);
  result.halo.gameHistory = await lib.halo.mcc['@0.0.10'].games.latest({
    gamertag: GAMERTAG,
    game: 'Halo: Reach',
    gameType: 'All'
  });

  console.log(`Seeing if we've stored the latest game time...`);
  let lastGameTime = await lib.utils.kv['@0.1.16'].get({
    key: `Halo:LastGameAt`,
    defaultValue: ``
  });

  // Make sure `FORCE_MESSAGE` is `false` before deploying.
  // Change to `true` above if you want to debug message sending.
  if (FORCE_MESSAGE || (result.halo.gameHistory.games.length && lastGameTime !== result.halo.gameHistory.games[0].playedAt)) {

    // This is a new game...
    console.log(`Store latest game time...`);
    result.utils.ok = await lib.utils.kv['@0.1.16'].set({
      key: `Halo:LastGameAt`,
      value: result.halo.gameHistory.games[0].playedAt
    });

    // If it's a new session, text everyone
    // Otherwise, just text me the results of the game
    let phoneNumbers = [];
    let newSessionMessage = '';
    let newSessionFooter = '';
    let delta = Math.floor((new Date().valueOf() - new Date(lastGameTime).valueOf()) / 1000);
    let newDelta = Math.floor((new Date().valueOf() - new Date(result.halo.gameHistory.games[0].playedAt).valueOf()) / 1000);
    if (!lastGameTime || (delta > (2 * 60 * 60) && newDelta < 1800)) {
      // this is a new gaming session, either we haven't recorded a game before OR it's been >2h since last game
      //  AND this game happened within the last 30 minutes
      console.log(`Messaging for a new gaming session (incl. friends)...`);
      phoneNumbers = PHONE_NUMBERS.slice(0);
      newSessionMessage = `🎮 ${result.halo.gameHistory.gamertag} has started a new Halo: Reach session!\n\n`;
      newSessionFooter = `\n\nℹ️ This is an experimental Halo API automation brought to you by the team at Standard Library.`;
    } else {
      // If it's not a new gaming session, only message the first number (yours)
      console.log(`Messaging for an existing gaming session (just you)...`);
      phoneNumbers = PHONE_NUMBERS.slice(0, 1);
    }

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

  } else {

    console.log(`No message sent. If you need to debug, try setting FORCE_MESSAGE to true.`);

  }

  return result;

};
