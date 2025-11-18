# ===== utilities.py =====

# ----------------------------
# Core Data Structures
# ----------------------------
INSTRUMENTS = [
    {"code": "full_music", "name": "Full Music"},
    {"code": "piano", "name": "Piano"},
    {"code": "guitar", "name": "Guitar"},
    {"code": "violin", "name": "Violin"},
    {"code": "drums", "name": "Drums"},
    {"code": "bass", "name": "Bass"},
    {"code": "flute", "name": "Flute"},
    {"code": "bell", "name": "Bell"},
]

GENRES = [
    "Pop", "Rock", "Hip-Hop", "Electronic", "Country",
    "R&B", "Metal", "Reggae"
]

LANGUAGES = [
    "English", "Chinese", "French", "German", "Hindi",
    "Italian", "Japanese", "Korean", "Polish", "Portuguese",
    "Russian", "Spanish", "Turkish", "Arabic"
]

TTS_ENGINES = ["Bark AI", "Coqui XTTS"]

LANGUAGE_CODE_MAP = {
    "english": "en",
    "chinese": "zh",
    "french": "fr",
    "german": "de",
    "hindi": "hi",
    "italian": "it",
    "japanese": "ja",
    "korean": "ko",
    "polish": "pl",
    "portuguese": "pt",
    "russian": "ru",
    "spanish": "es",
    "turkish": "tr",
    "arabic": "ar",
}


def genre_bias_text(genre, lang_code):
    genre = genre.lower()
    lang_code = lang_code.lower()
    bias_texts = {
        "pop": {
            "en": "\nLove tonight\nDancing under lights\nYou and I forever\nHeartbeat racing\n",
            "ar": "\nحب هذه الليلة\nنرقص تحت الأضواء\nأنت وأنا إلى الأبد\nنبضات القلب تتسارع\n",
            "zh": "\n今夜的愛\n在燈光下跳舞\n你和我永遠\n心跳加速\n",
            "fr": "\nAmour ce soir\nDanser sous les lumières\nToi et moi pour toujours\nLe cœur s'accélère\n",
            "de": "\nLiebe heute Nacht\nUnter Lichtern tanzen\nDu und ich für immer\nHerzschlag rast\n",
            "it": "\nAmore stanotte\nBallando sotto le luci\nTu ed io per sempre\nIl cuore che batte forte\n",
            "ru": "\nЛюбовь сегодня ночью\nТанцуем под огнями\nТы и я навсегда\nУчащенное сердцебиение\n",
            "es": "\nAmor esta noche\nBailando bajo luces\nTú y yo por siempre\nEl corazón acelerado\n",
        },
        "rock": {
            "en": "\nElectric nights\nGuitars screaming loud\nNo more chains\nRide till the dawn\n",
            "ar": "\nليالٍ كهربائية\nغيتارات تصرخ بصوت عالٍ\nلا قيود بعد اليوم\nانطلق حتى الفجر\n",
            "zh": "\n電光之夜\n吉他尖叫響亮\n沒有更多枷鎖\n騎行直到黎明\n",
            "fr": "\nNuits électriques\nGuitares hurlantes\nPlus de chaînes\nRouler jusqu'à l'aube\n",
            "de": "\nElektrische Nächte\nGitarren schreien laut\nKeine Ketten mehr\nReite bis zum Morgengrauen\n",
            "it": "\nNotti elettriche\nChitarre che urlano forte\nNiente più catene\nCavalca fino all'alba\n",
            "ru": "\nЭлектрические ночи\nГитары громко кричат\nНет больше цепей\nЕхать до рассвета\n",
            "es": "\nNoches eléctricas\nGuitarras gritando fuerte\nNo más cadenas\nCabalgando hasta el amanecer\n",
        },
        "hip-hop": {
            "en": "\nYeah we rise up\nBeats on the block\nTruth in my lines\nRespect the grind\n",
            "ar": "\nنعم نحن ننهض\nإيقاعات في الحي\nالحقيقة في كلماتي\nاحترم الكفاح\n",
            "zh": "\n是的 我們崛起\n街區上的節拍\n我詞句裡的真實\n尊重奮鬥\n",
            "fr": "\nOui, nous nous élevons\nRythmes dans le quartier\nLa vérité dans mes lignes\nRespecte le travail\n",
            "de": "\nJa wir steigen auf\nBeats im Block\nWahrheit in meinen Zeilen\nRespektiere die Mühle\n",
            "it": "\nSì, ci solleviamo\nBattiti sul blocco\nVerità nelle mie righe\nRispettare il lavoro\n",
            "ru": "\nЭлектрические ночи\nГитары громко кричат\nНет больше цепей\nЕхать до рассвета\n",
            "es": "\nSí nos levantamos\nBeats en el barrio\nVerdad en mis líneas\nRespeta el esfuerzo\n",
        },
        "electronic": {
            "en": "\nFeel the bassline move\nLights flashing in blue\nEchoes through the night\nWe never stop\n",
            "ar": "\nاشعر بالبيس يتحرك\nأضواء تومض باللون الأزرق\nأصداء في الليل\nلن نتوقف أبداً\n",
            "zh": "\n感受低音律動\n藍色的燈光閃爍\n迴響穿過夜晚\n我們永不停歇\n",
            "fr": "\nSentez la ligne de basse bouger\nLumières clignotant en bleu\nÉchos dans la nuit\nNous n'arrêtons jamais\n",
            "de": "\nSpüre den Bass\nLichter blinken blau\nEchos durch die Nacht\nWir hören nie auf\n",
            "it": "\nSenti il basso muoversi\nLuci che lampeggiano in blu\nEchi nella notte\nNon ci fermiamo mai\n",
            "ru": "\nПочувствуй движение баса\nОгни мигают синим\nЭхо сквозь ночь\nМы никогда не остановимся\n",
            "es": "\nSiente la línea de bajo moverse\nLuces azules parpadeando\nEcos en la noche\nNunca paramos\n",
        },
        "country": {
            "en": "\nDusty road and open sky\nHeart back home\nWhiskey dreams\nSimple love tonight\n",
            "ar": "\nطريق ترابي وسماء مفتوحة\nالقلب يعود للوطن\nأحلام الويسكي\nحب بسيط هذه الليلة\n",
            "zh": "\n塵土飛揚的路和開闊的天空\n心回故鄉\n威士忌的夢\n今夜簡單的愛\n",
            "fr": "\nRoute poussiéreuse et ciel ouvert\nLe cœur à la maison\nRêves de whisky\nAmour simple ce soir\n",
            "de": "\nStaubige Straße und offener Himmel\nHerz wieder zu Hause\nWhiskey-Träume\nEinfache Liebe heute Nacht\n",
            "it": "\nStrada polverosa e cielo aperto\nCuore a casa\nSogni di whisky\nSemplice amore stanotte\n",
            "ru": "\nПыльная дорога и открытое небо\nСердце вернулось домой\nВиски-мечты\nПростая любовь сегодня ночью\n",
            "es": "\nCamino polvoriento y cielo abierto\nCorazón de vuelta a casa\nSueños de whisky\nAmor simple esta noche\n",
        },
        "r&b": {
            "en": "\nSmooth rhythm slow dance\nUnder moonlight you sway\nI feel your touch\nForever stay\n",
            "ar": "\nإيقاع ناعم ورقص بطيء\nتحت ضوء القمر تتمايل\nأشعر بلمستك\nالبقاء للأبد\n",
            "zh": "\n平滑的節奏 慢舞\n在月光下你搖擺\n我感受到你的觸摸\n永遠停留\n",
            "fr": "\nRythme doux danse lente\nSous la lumière de la lune tu te balances\nJe sens ton contact\nReste pour toujours\n",
            "de": "\nSanfter Rhythmus langsamer Tanz\nUnter Mondlicht wiegst du dich\nIch fühle deine Berührung\nBleib für immer\n",
            "it": "\nRitmo morbido ballo lento\nSotto la luna dondoli\nSento il tuo tocco\nResta per sempre\n",
            "ru": "\nПлавный ритм медленный танец\nПод лунным светом ты покачиваешься\nЯ чувствую твое прикосновение\nОстанься навсегда\n",
            "es": "\nRitmo suave baile lento\nBajo la luz de la luna te meces\nSiento tu tacto\nQuédate para siempre\n",
        },
        "metal": {
            "en": "\nScreaming thunder\nDark horizon rise\nFire within my veins\nThrough chaos I survive\n",
            "ar": "\nرعد يصرخ\nأفق مظلم يرتفع\nنار داخل عروقي\nأنجو من خلال الفوضى\n",
            "zh": "\n尖叫的雷鳴\n黑暗地平線升起\n火焰在我血管裡\n穿越混亂我倖存\n",
            "fr": "\nTonnerre hurlant\nHorizon sombre s'élève\nFeu dans mes veines\nÀ travers le chaos je survis\n",
            "de": "\nSchreiender Donner\nDunkler Horizont steigt\nFeuer in meinen Adern\nDurch Chaos überlebe ich\n",
            "it": "\nTuono urlante\nOrrizzonte oscuro si alza\nFuoco nelle mie vene\nAttraverso il caos sopravvivo\n",
            "ru": "\nПочувствуй движение баса\nОгни мигают синим\nЭхо сквозь ночь\nМы никогда не остановимся\n",
            "es": "\nTrueno gritando\nOscuro horizonte se alza\nFuego en mis venas\nA través del caos sobrevivo\n",
        },
        "reggae": {
            "en": "\nIsland sun\nOne love and unity\nFreedom song\nFeel the vibe naturally\n",
            "ar": "\nشمس الجزيرة\nحب واحد ووحدة\nأغنية الحرية\nاشعر بالإحساس بشكل طبيعي\n",
            "zh": "\n海島的陽光\n一份愛和團結\n自由之歌\n自然感受氛圍\n",
            "fr": "\nSoleil de l'île\nUn seul amour et unité\nChant de liberté\nSentez l'ambiance naturellement\n",
            "de": "\nInsel-Sonne\nEine Liebe und Einheit\nFreiheitslied\nFühle den Vibe natürlich\n",
            "it": "\nSole dell'isola\nUnico amore e unità\nCanto di libertà\nSenti l'atmosfera naturalmente\n",
            "ru": "\nПочувствуй движение баса\nОгни мигают синим\nЭхо сквозь ночь\nМы никогда не остановимся\n",
            "es": "\nSol de la isla\nUn solo amor y unidad\nCanción de libertad\nSiente la vibra naturalmente\n",
        },
    }

    return bias_texts.get(genre, {}).get(lang_code, bias_texts.get(genre, {}).get('en', ""))
