# ===== instrument_options.py =====

# ----------------------------
# Vocal and Style Configuration
# ----------------------------
MALE_VOICE_NAMES = [
    # English male voice names
    # Hi, I'm Jake, this is a voice test. I will be saying: the quick brown fox jumps over the lazy dog.
    "Bryce", "Jake", "Ryan", "Joe", "Noah", "Norman",

    'Li Wei',  # 大家好，我是 Li Wei，这是一个语音测试。我将要说的是： 举杯邀明月对影成三人。
    'Jun Hao',  # 大家好，我是 Jun Hao，这是一个语音测试。我将要说的是： 举杯邀明月对影成三人。
    'Chen Ming',  # 大家好，我是 Chen Ming，这是一个语音测试。我将要说的是： 举杯邀明月对影成三人。

    'Jean',
    # Salut, je suis Jean, ceci est un test vocal. Je dirai : Le rapide renard brun saute par-dessus le chien paresseux.
    'Luc',
    # Salut, je suis Luc, ceci est un test vocal. Je dirai : Le rapide renard brun saute par-dessus le chien paresseux.
    'Marc',
    # Salut, je suis Marc, ceci est un test vocal. Je dirai : Le rapide renard brun saute par-dessus le chien paresseux.

    # German male voice names
    'Lukas',
    # Hallo, ich bin Lukas, dies ist eine Probeaufnahme. Ich werde sagen: Ein kleiner brauner Fuchs springt über den langsamen Hund.
    'Felix',
    # Hallo, ich bin Felix, dies ist eine Probeaufnahme. Ich werde sagen: Ein kleiner brauner Fuchs springt über den langsamen Hund.
    'Jonas',
    # Hallo, ich bin Jonas, dies ist eine Probeaufnahme. Ich werde sagen: Ein kleiner brauner Fuchs springt über den langsamen Hund.

    # Hindi male voice names
    'Arjun',
    # नमस्ते, मैं Arjun हूँ, यह एक आवाज़ का परीक्षण है। मैं कहूँगा: ज्ञानवान् होकर भी, मनुष्य अपनी बुद्धि और क्षमता से ही सब कुछ नहीं कर सकता।
    'Rohan',
    # नमस्ते, मैं Rohan हूँ, यह एक आवाज़ का परीक्षण है। मैं कहूँगा: ज्ञानवान् होकर भी, मनुष्य अपनी बुद्धि और क्षमता से ही सब कुछ नहीं कर सकता।
    'Vikram',
    # नमस्ते, मैं Vikram हूँ, यह एक आवाज़ का परीक्षण है। मैं कहूँगा: ज्ञानवान् होकर भी, मनुष्य अपनी बुद्धि और क्षमता से ही सब कुछ नहीं कर सकता।

    # Italian male voice names
    'Marco',  # Ciao, sono Marco, questa è una prova vocale. Dirò: Pranzo d'acqua fa buon brodo.
    'Lorenzo',  # Ciao, sono Lorenzo, questa è una prova vocale. Dirò: Pranzo d'acqua fa buon brodo.
    'Paolo',  # Ciao, sono Paolo, questa è una prova vocale. Dirò: Pranzo d'acqua fa buon brodo.

    # Japanese male voice names
    'Ren',  # こんにちは、Renです。これは音声テストです。私はこう言います：いろはにほへと ちりぬるを わかよたれそ つねならむ うゐのおくやま けふこえて あさきゆめみし ゑひもせす。
    'Haruto',  # こんにちは、Harutoです。これは音声テストです。私はこう言います：いろはにほへと ちりぬるを わかよたれそ つねならむ うゐのおくやま けふこえて あさきゆめみし ゑひもせす。
    'Sora',  # こんにちは、Soraです。これは音声テストです。私はこう言います：いろはにほへと ちりぬるを わかよたれそ つねならむ うゐの おくやま けふこえて あさきゆめみし ゑひもせす。

    # Korean male voice names
    'Min Jun',  # 안녕하세요, 저는 Min Jun입니다. 이것은 음성 테스트입니다. 제가 말할 문장은: 다람쥐 헌 쳇바퀴에 타고파.
    'Ji Hoon',  # 안녕하세요, 저는 Ji Hoon입니다. 이것은 음성 테스트입니다. 제가 말할 문장은: 다람쥐 헌 쳇바퀴에 타고파.
    'Seung Woo',  # 안녕하세요, 저는 Seung Woo입니다. 이것은 음성 테스트입니다. 제가 말할 문장은: 다람쥐 헌 쳇바퀴에 타고파.

    # Polish male voice names
    'Adam',  # Cześć, jestem Adam, to jest test głosu. Powiem: Pchnąć w tę łódź jeża lub oś skrzyń fig.
    'Tomasz',  # Cześć, jestem Tomasz, to jest test głosu. Powiem: Pchnąć w tę łódź jeża lub oś skrzyń fig.
    'Marek',  # Cześć, jestem Marek, to jest test głosu. Powiem: Pchnąć w tę łódź jeża lub oś skrzyń fig.

    # Portuguese male voice names
    'Tiago',  # Olá, sou o Tiago, este é um teste de voz. Eu direi: Um pequeno graxaim é um animal ágil e veloz.
    'Rafael',  # Olá, sou o Rafael, este é um teste de voz. Eu direi: Um pequeno graxaim é um animal ágil e veloz.
    'Bruno',  # Olá, sou o Bruno, este é um teste de voz. Eu direi: Um pequeno graxaim é um animal ágil e veloz.

    # Russian male voice names
    'Ivan',  # Привет, я Ivan, это тест голоса. Я скажу: В чащах юга жил бы цитрус? Да, но фальшивый экземпляр!
    'Nikolai',  # Привет, я Nikolai, это тест голоса. Я скажу: В чащах юга жил бы цитрус? Да, но фальшивый экземпляр!
    'Dmitri',  # Привет, я Dmitri, это тест голоса. Я скажу: В чащах юга жил бы цитрус? Да, но фальшивый экземпляр!

    # Spanish male voice names
    'Diego',  # Hola, soy Diego, esta es una prueba de voz. Diré: El veloz murciélago hindú comía feliz cardillo y kiwi.
    'Javier',
    # Hola, soy Javier, esta es una prueba de voz. Diré: El veloz murciélago hindú comía feliz cardillo y kiwi.
    'Luis',  # Hola, soy Luis, esta es una prueba de voz. Diré: El veloz murciélago hindú comía feliz cardillo y kiwi.

    # Turkish male voice names
    'Emre',  # Merhaba, ben Emre, bu bir ses testidir. Şunu söyleyeceğim: Pijamalı hasta yağız şoföre çabucak güvendi.
    'Can',  # Merhaba, ben Can, bu bir ses testidir. Şunu söyleyeceğim: Pijamalı hasta yağız şoföre çabucak güvendi.
    'Mert',  # Merhaba, ben Mert, bu bir ses testidir. Şunu söyleyeceğim: Pijamalı hasta yağız şoföre çabucak güvendi.

    # Arabic
    'Omar', 'Sami', 'Ali',

]

FEMALE_VOICE_NAMES = [
    # English female voice names
    "Amy", "Jill", "Lily", "Rose", "Mia", "Jenny",

    # Chinese female voice names
    'Mei Lin',  # 大家好，我是 Mei Lin，这是一个语音测试。我将要说的是： 举杯邀明月对影成三人。
    'Xiao Yan',  # 大家好，我是 Xiao Yan，这是一个语音测试。我将要说的是： 举杯邀明月对影成三人。
    'Lian Hua',  # 大家好，我是 Lian Hua，这是一个语音测试。我将要说的是： 举杯邀明月对影成三人。

    # French female voice names (Using the translated general English pangram)
    'Claire',
    # Salut, je suis Claire, ceci est un test vocal. Je dirai : Le rapide renard brun saute par-dessus le chien paresseux.
    'Sophie',
    # Salut, je suis Sophie, ceci est un test vocal. Je dirai : Le rapide renard brun saute par-dessus le chien paresseux.
    'Elise',
    # Salut, je suis Elise, ceci est un test vocal. Je dirai : Le rapide renard brun saute par-dessus le chien paresseux.

    'Anna',
    # Hallo, ich bin Anna, dies ist eine Probeaufnahme. Ich werde sagen: Ein kleiner brauner Fuchs springt über den langsamen Hund.
    'Mila',
    # Hallo, ich bin Mila, dies ist eine Probeaufnahme. Ich werde sagen: Ein kleiner brauner Fuchs springt über den langsamen Hund.
    'Lena',
    # Hallo, ich bin Lena, dies ist eine Probeaufnahme. Ich werde sagen: Ein kleiner brauner Fuchs springt über den langsamen Hund.

    # Hindi female voice names
    'Asha',
    # नमस्ते, मैं Asha हूँ, यह एक आवाज़ का परीक्षण है। मैं कहूँगा: ज्ञानवान् होकर भी, मनुष्य अपनी बुद्धि और क्षमता से ही सब कुछ नहीं कर सकता।
    'Mira',
    # नमस्ते, मैं Mira हूँ, यह एक आवाज़ का परीक्षण है। मैं कहूँगा: ज्ञानवान् होकर भी, मनुष्य अपनी बुद्धि और क्षमता से ही सब कुछ नहीं कर सकता।
    'Priya',
    # नमस्ते, मैं Priya हूँ, यह एक आवाज़ का परीक्षण है। मैं कहूँगा: ज्ञानवान् होकर भी, मनुष्य अपनी बुद्धि और क्षमता से ही सब कुछ नहीं कर सकता।

    # Italian female voice names
    'Sofia',  # Ciao, sono Sofia, questa è una prova vocale. Dirò: Pranzo d'acqua fa buon brodo.
    'Giulia',  # Ciao, sono Giulia, questa è una prova vocale. Dirò: Pranzo d'acqua fa buon brodo.
    'Elena',  # Ciao, sono Elena, questa è una prova vocale. Dirò: Pranzo d'acqua fa buon brodo.

    # Japanese female voice names
    'Yuna',  # こんにちは、Yunaです。これは音声テストです。私はこう言います：いろはにほへと ちりぬるを わかよたれそ つねならむ うゐのおくやま けふこえて あさきゆめみし ゑひもせす。
    'Hana',  # こんにちは、Hanaです。これは音声テストです。私はこう言います：いろはにほへと ちりぬるを わかよたれそ つねならむ うゐのおくやま けふこえて あさきゆめみし ゑひもせす。
    'Aiko',  # こんにちは、Aikoです。これは音声テストです。私はこう言います：いろはにほへと ちりぬるを わかよたれそ つねならむ うゐのおくやま けふこえて あさきゆめみし ゑひもせす。

    # Korean female voice names
    'Seo Yeon',  # 안녕하세요, 저는 Seo Yeon입니다. 이것은 음성 테스트입니다. 제가 말할 문장은: 다람쥐 헌 쳇바퀴에 타고파.
    'Min Ji',  # 안녕하세요, 저는 Min Ji입니다. 이것은 음성 테스트입니다. 제가 말할 문장은: 다람쥐 헌 쳇바퀴에 타고파.
    'Ha Neul',  # 안녕하세요, 저는 Ha Neul입니다. 이것은 음성 테스트입니다. 제가 말할 문장은: 다람쥐 헌 쳇바퀴에 타고파.

    # Polish female voice names
    'Kasia',  # Cześć, jestem Kasia, to jest test głosu. Powiem: Pchnąć w tę łódź jeża lub oś skrzyń fig.
    'Magda',  # Cześć, jestem Magda, to jest test głosu. Powiem: Pchnąć w tę łódź jeża lub oś skrzyń fig.
    'Zofia',  # Cześć, jestem Zofia, to jest test głosu. Powiem: Pchnąć w tę łódź jeża lub oś skrzyń fig.

    # Portuguese female voice names
    'Inês',  # Olá, sou a Inês, este é um teste de voz. Eu direi: Um pequeno graxaim é um animal ágil e veloz.
    'Marina',  # Olá, sou a Marina, este é um teste de voz. Eu direi: Um pequeno graxaim é um animal ágil e veloz.
    'Carla',  # Olá, sou a Carla, este é um teste de voz. Eu direi: Um pequeno graxaim é um animal ágil e veloz.

    # Russian female voice names
    'Nadia',  # Привет, я Nadia, это тест голоса. Я скажу: В чащах юга жил бы цитрус? Да, но фальшивый экземпляр!
    'Irina',  # Привет, я Irina, это тест голоса. Я скажу: В чащах юга жил бы цитрус? Да, но фальшивый экземпляр!
    'Katya',  # Привет, я Katya, это тест голоса. Я скажу: В чащах юга жил бы цитрус? Да, но фальшивый экземпляр!

    # Spanish female voice names
    'Lucia',  # Hola, soy Lucia, esta es una prueba de voz. Diré: El veloz murciélago hindú comía feliz cardillo y kiwi.
    'Carmen',
    # Hola, soy Carmen, esta es una prueba de voz. Diré: El veloz murciélago hindú comía feliz cardillo y kiwi.
    'Isabella',
    # Hola, soy Isabella, esta es una prueba de voz. Diré: El veloz murciélago hindú comía feliz cardillo y kiwi.

    # Turkish female voice names
    'Leyla',  # Merhaba, ben Leyla, bu bir ses testidir. Şunu söyleyeceğim: Pijamalı hasta yağız şoföre çabucak güvendi.
    'Merve',  # Merhaba, ben Merve, bu bir ses testidir. Şunu söyleyeceğim: Pijamalı hasta yağız şoföre çabucak güvendi.
    'Aylin',  # Merhaba, ben Aylin, bu bir ses testidir. Şunu söyleyeceğim: Pijamalı hasta yağız şoföre çabucak güvendi.

    # Arabic
    'Reem', 'Hind', 'Rana'
]

VOCAL_STYLES = ["Random", "Male", "Female"]
