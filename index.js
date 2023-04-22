const { Telegraf } = require('telegraf');
const { message } = require('telegraf/filters');

const mongoose = require('mongoose');
const passwordMongoAtlas = process.env['passwordMongoAtlas']

mongoose.connect(`mongodb+srv://cashbot:${passwordMongoAtlas}@cashbot.mfip4hy.mongodb.net/cashbot?retryWrites=true&w=majority`);

let mass_of_businessman = ["Джеф Безос", "Илон Маск" , "Трейдер Олег", "Игорь Рыбаков", "Билл ГейТС" , "Бернар Арно", "Марк Цукерберг", "Тони Старк", "Дженна Ортега", "Эмма Маерз", "Лионель Месси", "Криштиано Рональду", "Неймар Джуниор", "Майкл Блумберг", "Волк с Уолт Стрит", "Джордан Белфорт"];
let mass_of_phrases = ["Братанчик, не так быстро" , "Бро, куда ты торопишься" , "STOP, man" , "ВОУ ВОУ ДРУЖОЧЕК КУДА ТЫ ТАК, попридержи коней" , "Хей чел, куда ты несешься тебе надо отдохнуть" , "Братан, пойди лучше выпей кофеек. Команда: /coffee", "Браточек остуди свой пыл", "Я думаю тебе стоит остановиться", "Братанчик не агрессируй, не будь как сам знаешь кто", "БРО БОТ ВИДИТ ТВОЮ СТРЕМИТЕЛЬНОСТЬ, НО ПОЙМИ НУЖЕН ОТДЫХ" , "Тебе стоит поспать",];
let mass_lose = ["Не расстраивайся brother или sister", "ВОУ ВОУ ВОУ НЕ МОЖЕТ БЫТЬ","Играть в рулетку было ошибкой, но ошибки делают нас сильнее"];
let mass_win = ["Ого, ты реальный везунчик", "Тебе повезло, попробуй снова", "Отлично сыгранно", "Сегодня ты победитель","Тебе в казино пора"]

let userShema = new mongoose.Schema({
  username: String,
  balance: Number,
  userId: Number,
  kdTime: Number,
  updater: Number,
  chatId: Number
},
  { 
    timestamps: true 
  });

let Users = mongoose.model('user', userShema);

const token = process.env['token'];
const bot = new Telegraf(token);

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
} // Генерация рандомного числе (относительно рандомного)

bot.start((ctx) => {
  ctx.replyWithPhoto({ source: `assets/moneymore.jpg`}, {caption: "Здарова Братанчик! Этот Cashbot сможет давать тебе тонны виртуальных зеленых! Начни зарабатывать сегодня вместе с нашим ботом и соревнуйся со своими кентами"});
});

bot.command("cash", async (ctx) => {
  let addMoney = getRandomInt(1000, 10000);
  let user = await Users.findOne({userId: ctx.message.from.id});

  if(user == null){
    let newUser = new Users({
      userId: ctx.message.from.id,
      username: ctx.message.from.username,
      balance: addMoney,
      updater: 1,
      chatId: ctx.message.chat.id
    });
    await newUser.save();

    ctx.replyWithHTML(`Вы заработали: ${addMoney} $.\nВаш баланс: ${addMoney} $.`);
    
    return;
  }
  let businessman = mass_of_businessman[getRandomInt(0, mass_of_businessman.length)];
  let bandomPhrase = mass_of_phrases[getRandomInt(0, mass_of_phrases.length)];
  
  user.updater += 1
  await user.save();
  
  let date = Date.parse(user.updatedAt);
  let kdTime = user.kdTime;

  if(date < kdTime){
    let timeOut = kdTime - date;
    ctx.reply(`${bandomPhrase}. Даже ${businessman} не так быстро рубит бабки! Тебе осталось ${Math.round((kdTime - date) / 60000)} минуток.`);
    return;
  }
  
  let balance = user.balance;
  user.balance = balance + addMoney;
  user.kdTime = date + 1800000;
    
  await user.save();
    
  ctx.replyWithHTML(`Вы заработали: ${addMoney} $.\nВаш баланс: ${user.balance} $.`);
}) // CASH

bot.command("balance", async (ctx) => {
  let user = await Users.findOne({userId: ctx.message.from.id});
  if(user == null){
    let newUser = new Users({
      userId: ctx.message.from.id,
      username: ctx.message.from.username,
      balance: 0,
      updater: 1,
      chatId: ctx.message.chat.id
    });
    await user.save();
    return;
  }

  let newBalance = user.balance
  ctx.replyWithHTML(`Ваш баланс: ${newBalance} $.`);
}) // BALANCE

bot.command("top", async (ctx) => {
  let users = await Users.find().sort({balance: -1}).limit(10);
  let newBalance = users.balance;
  let topMessage = `Топ богачей`
  for(i = 0; i < users.length; i++){
    topMessage = `${topMessage}\n${i+1}. @${users[i].username}: ${users[i].balance} $.`;
  }
  
  ctx.replyWithHTML(topMessage);
}) // TOP

bot.command("roulete", async (ctx) => {
  let user = await Users.findOne({userId: ctx.message.from.id});
  let moneyPush = getRandomInt(-750, 750);
  
  if(user == null){
    let newUser = new Users({
      userId: ctx.message.from.id,
      username: ctx.message.from.username,
      balance: moneyPush,
      updater: 1,
      chatId: ctx.message.chat.id
    });
    await user.save();
    return;
  }
  
  user.balance = user.balance + moneyPush;
  
  await user.save();

  if(moneyPush < 0){
    ctx.replyWithHTML(`${mass_lose[getRandomInt(0, mass_lose.length)]}. Ты проиграл: ${moneyPush} $.\nВаш баланс: ${user.balance} $.`);
  } else {
    ctx.replyWithHTML(`${mass_win[getRandomInt(0, mass_win.length)]}. Ты выиграл: ${moneyPush} $.\nВаш баланс: ${user.balance} $.`);
  }
  
  await user.save();
}); // ROULETE

bot.command("help", async (ctx) => {
  ctx.replyWithHTML(`/cash - Команда, которая помогает тебе заработать.\n/roulete - Команда, которая позволяет тебе получить рандомное число денег.\n/top - Команда, которая позволяет тебе посмотреть список лидеров.\n/balance - Команда, которая позволяет тебе посмотреть свой баланс.`);
}) // HELP

bot.command("getmoremoney", async (ctx) => {
  let user = await Users.findOne({userId: ctx.message.from.id});
  user.balance += 10000;
  
  if(user == null){
    let newUser = new Users({
      userId: ctx.message.from.id,
      username: ctx.message.from.username,
      balance: addMoney,
      updater: 1,
      chatId: ctx.message.chat.id
    });
    await user.save();
    return;
  }
  await user.save();
  ctx.replyWithHTML(`Ваш баланс: ${user.balance} $.`);
}); // GETMOREMONEY

bot.command("send", async (ctx) => {
  let user = await Users.findOne();
  let text = ctx.message.text.replace('/send', '').split(' ');
  let chatId = text[1];
  let chatMessage = text[2];
  for(let i = 3; i < text.length; i++){
    chatMessage += ` ${text[i]}`;
  };
  if(user.username == "k1vitaly" || user.username == "Vanyochek228"){
    ctx.telegram.sendMessage(chatId, chatMessage);
  } else {
    ctx.reply("Authorization error");
  }
}) // Команда для отправки сообщений от имени бота.

bot.command("chats", async (ctx) => {
  let user = await Users.findOne();
  if(user.username == "k1vitaly" || user.username == "Vanyochek228"){
    let chats = user.chatId;
    ctx.reply(chats);
  } else {
    ctx.reply("Authorization error");
  }
}) // Команда показывает список всех чатов.

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

require('./server')();







