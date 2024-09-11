const { Telegraf } = require("telegraf");
const axios = require("axios");
const cheerio = require("cheerio");
const mongoose = require("mongoose");

// Initialize your bot with the bot token
const bot = new Telegraf("2135704783:AAGI_h-9RJlxlWHwrOw8zpvAZd0KZTdCKH4"); // Replace with your bot token
let emojis = [
  "💫",
  "🪐",
  "☀️",
  "💥",
  "🔥",
  "⚡️",
  "✨",
  "🌟",
  "🥇",
  "🏆",
  "🎗",
  "🎸",
  "✈️",
  "🌠",
  "🌅",
  "📜",
  "✊",
  "🙌",
];

// Connect to MongoDB Atlas
mongoose
  .connect(
    "mongodb+srv://xodjakovdilshodbek:nX1MWTxiVh6mw5Uw@cluster0.yjmkd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Er ror connecting to MongoDB", err);
  });

// Define a schema and model for saving user data
const userSchema = new mongoose.Schema({
  telegramId: String,
  username: String,
  firstName: String,
  requestedText: String,
  requestedAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

// Function to scrape data
const scrapeData = async (name) => {
  try {
    // Fetch the HTML of the page
    const { data } = await axios.get(`https://ismlar.com/search/${name}`);
    // Load the HTML into cheerio
    const $ = cheerio.load(data);

    // Select the content from 'ul' with class 'none-list' and the 'div' inside it
    const content = $("li.rounded-2xl h2.font-bold").first().text();
    const content2 = $("li.rounded-2xl div.space-y-4").first().text();

    // Return the extracted text content
    return (
      { name: content.trim(), desc: content2.trim() } ||
      "Sorry, no information found."
    );
  } catch (error) {
    console.error("Error fetching the page:", error);
    return "Sorry, an error occurred while fetching data.";
  }
};

// Set up the bot to listen for text messages
bot.on("text", async (ctx) => {
  const text = ctx.message.text.toLowerCase();
  const userId = ctx.message.from.id;
  const username = ctx.message.from.username;
  const firstName = ctx.message.from.first_name;

  // Save the user request in the database
  const user = new User({
    telegramId: userId,
    username: username,
    firstName: firstName,
    requestedText: text,
  });

  // Save the user in the database
  await user
    .save()
    .then(() => {
      console.log("User saved to database");
    })
    .catch((err) => {
      console.error("Error saving user to database", err);
    });

  // Get random emoji for formatting
  let random = Math.floor(Math.random() * emojis.length);

  // Scrape the data
  const content = await scrapeData(text);

  // Respond to the user
  ctx.reply(
    `<b><u>Ism</u>: ${
      text == content?.name?.toLowerCase()
        ? `${emojis[random]} ${content?.name} ${emojis[random]}`
        : `${ctx.message.text} => ${content?.name} 👀`
    }</b>\n\n<b><u>Manosi</u></b>:  ${content?.desc?.trim()}\n\n 🙌 @isimlar_manosi_khd_bot`,
    { parse_mode: "HTML" }
  );
});

// Start the bot
bot.launch();
console.log("Bot is running...");

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
