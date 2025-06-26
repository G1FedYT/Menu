import telebot
bot = telebot.TeleBot('8055668233:AAEQuXcQMOoeSsj04Z1uxSJFz6kT5QoDROw')  #7607776658:AAGDVI_aSFJXDqOBON20-kQ6Vb_QWBU8fN8

@bot.message_handler(commands=['id'])
def main(message):
    bot.send_message(message.chat.id, ' 😂Вот' + str(message))
    
@bot.channel_post_handler()
def channel_post(message):
    bot.send_message(message.chat.id, f'Канал ID: {message.chat.id}\n{message}')
    
bot.polling(none_stop=True)