const TelegramBot = require("node-telegram-bot-api");
const mongoose = require("mongoose");

const token = "7446393203:AAFyuVzNlHnRLaUB0u9VfRfoPLZTZGPOS-M";
const admins = [2017025737];
const username = "https://t.me/account_lootshopbot";
const websiteLink = "";

const mainMenu = {
  reply_markup: {
    keyboard: [[{ text: "👤 Profil" }], [{ text: "👤 Profil" }]],
    resize_keyboard: true,
  },
};

const adminMenu = {
  reply_markup: {
    inline_keyboard: [
      [{ text: "📊 Statistika", callback_data: "admin_stats" }],
      [{ text: "➕ Kanal qo'shish", callback_data: "admin_add_channel" }],
      [{ text: "❌ Kanal o'chirish", callback_data: "admin_remove_channel" }],
      [
        {
          text: "✉️ Foydalanuvchilarga habar yuborish",
          callback_data: "admin_send_message",
        },
      ],
      [
        {
          text: "🔧 Ball ni o'zgartirish",
          callback_data: "admin_change_points",
        },
      ],
      [
        {
          text: "🛑 Konkursni toxtatish",
          callback_data: "stop_konkurs",
        },
      ],
      [
        {
          text: "✅ Konkursni Yoqish",
          callback_data: "start_konkurs",
        },
      ],
    ],
  },
};

const bot = new TelegramBot(token, { polling: true });

// MANGODB
mongoose
  .connect(
    "mongodb+srv://lootshopbot:rDMdkLeh70vV0C2S@lootshop.vsalq.mongodb.net/?retryWrites=true&w=majority&appName=LootShop"
  )
  .then(() => {
    console.log("Conect to MangoDB!");
  })
  .catch((err) => {
    console.error("MongoDB conecct error:", err);
  });

const userSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true }, // ID raqam sifatida
  number: String,
  balance: Number,
  password: String,
  active: Number,
});

const User = mongoose.model("users", userSchema);

// USER

const findUserById = async (userId) => {
  try {
    // ID raqam string sifatida qidirish
    const user = await User.findOne({ id: userId });
    if (user) {
      return user;
    } else {
      console.log("Foydalanuvchi topilmadi", userId);
      return false;
    }
  } catch (err) {
    console.error("Xatolik yuz berdi:", err);
    return false;
  }
};

// Foydalanuvchini qo'shish
function addUser(id, number, password) {
  const newUser = new User({
    id: +id,
    number,
    password,
    balance: 0,
    active: 1,
  });
  newUser
    .save()
    .then(() => {
      console.log("Foydalanuvchi muvaffaqiyatli saqlandi");
    })
    .catch((err) => {
      console.error("Foydalanuvchini saqlashda xatolik:", err);
    });
}
const GetUsersCount = async (chatId, opts) => {
  // Foydalanuvchilar sonini olish
  const userCount = await User.countDocuments();
  bot.sendMessage(
    chatId,
    `<b>Foydaluvchilar soni: ${userCount} ta. \n\n${await getDate()}</b>`,
    opts
  );
};

const getAllUsers = async () => {
  try {
    const users = await User.find({}).lean();
    return users || [];
  } catch (error) {
    console.error("Foydalanuvchilarni olishda xatolik:", error.message);
    return [];
  }
};

// SEND MESSAGE
const ForwardMessageToAllUsers = async (chatId, messageId) => {
  const users = await getAllUsers();

  for (let user of users) {
    try {
      await bot.forwardMessage(user.id, chatId, messageId);
      console.log(`Habar yuborildi: ${user.id}`);
    } catch (error) {
      console.error(
        `Foydalanuvchiga habar yuborishda xatolik: ${user.id}`,
        error
      );
    }
  }
};

const sendMessageToAllUsers = async (message) => {
  const users = await getAllUsers();

  for (let user of users) {
    try {
      await bot.sendMessage(user.id, message);
      console.log(`Habar yuborildi: ${user.id}`);
    } catch (error) {
      console.error(
        `Foydalanuvchiga habar yuborishda xatolik: ${user.id}`,
        error
      );
    }
  }
};

// MAJBURIY OBUNA

async function checkUserMembership(msg, menu = true) {
  const chatId = msg?.chat?.id;
  const userId = msg?.from?.id;
  //   const channels = await loadChannels();
  const channels = [
    { id: 1, name: "Murodillayev Hojiakbar", link: "murodillayev_hojiakbar" },
  ];

  if (menu) {
    if (admins.includes(userId)) {
      //   await bot.sendMessage(chatId, "🖥.... Admin sahifasi", adminMenu);
      await bot.sendMessage(chatId, "🖥.... Asosiy menyu", {
        mainMenu,
      });
    } else {
      await bot.sendMessage(chatId, "🖥.... Asosiy sahifa", mainMenu);
    }
  }

  return true;

  //   const now = true;
  //   for (let channel of channels) {
  //     try {
  //       const chatMember = await bot.getChatMember(channel.chatId, userId);
  //       if (chatMember.status === "left" || chatMember.status === "kicked") {
  //         const options = {
  //           reply_markup: {
  //             inline_keyboard: channels.map((channel) => [
  //               {
  //                 text: channel.name,
  //                 url: channel.link,
  //               },
  //             ]),
  //           },
  //         };
  //         bot.sendMessage(
  //           chatId,
  //           "Botdan foydalanish uchun quyidagi kanallarga a'zo bo'ling:",
  //           options
  //         );
  //         now == false;
  //         return false;
  //         break;
  //       }
  //     } catch (error) {
  //       console.error(`Kanalni tekshirishda xato: ${channel.name}`, error);
  //       now == false;
  //       return false;
  //       break;
  //     }
  //   }
  //   if (now && menu) {
  //     if (adminId.includes(userId)) {
  //       await bot.sendMessage(chatId, "🖥.... Asosiy menyu", MainMenuForAdmin);
  //     } else {
  //       await bot.sendMessage(chatId, "🖥.... Asosiy menyu", mainMenu);
  //     }
  //   }
  //   return true;
}

const getDate = async () => {
  // Foydalanuvchilar sonini olish
  const date = new Date();
  return `⌚️ ${date.getFullYear()} ${date.getMonth()}-${date.getDate()}, ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
};

// PASSWORD GENERATE

function autoGeneratePassword(length = 12) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?";
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters[randomIndex];
  }

  return password;
}

// BOT START

const first = async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  // BOTDAN REGISTRATSIYA QILGANMI?

  if (await findUserById(userId)) {
    await checkUserMembership(msg);
  } else {
    return bot.sendMessage(
      chatId,
      "Botdan foydalanish uchun kontaktingizni yuboring:",
      {
        reply_markup: {
          keyboard: [
            [{ text: "📞 Kontaktni yuborish", request_contact: true }],
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      }
    );
  }
};

bot.on("contact", async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const contact = msg.contact;

  // Agar kontakt foydalanuvchiga tegishli bo'lmasa yoki Uzbek raqami bo'lmasa, foydalanuvchini ban qilish
  if (contact.user_id === userId && !(await findUserById(userId))) {
    await addUser(userId, contact?.phone_number, await autoGeneratePassword());
    await bot.sendMessage(chatId, `Qabul qilindi ${contact.phone_number}`);
  } else {
    await bot.sendMessage(
      chatId,
      `Noto'g'ri kontakt! Siz faqat o'z kontakingizni yubora olasiz. ${contact.phone_number}`
    );
    return false;
  }

  await checkUserMembership(msg);

  return;
  // Asosiy menyuni ko'rsatish
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  const opts = {
    parse_mode: "HTML",
  };

  if (msg.text === "/start") {
    await first(msg);
  } else {
    bot.sendMessage(userId, "!");
  }
});
