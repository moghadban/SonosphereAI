# Language Support Module

def get_language_support():
    return {
        "languages": [
            {"code": "en", "name": "English"},
            {"code": "es", "name": "Spanish"},
            {"code": "fr", "name": "French"},
            {"code": "de", "name": "German"},
            {"code": "it", "name": "Italian"},
            {"code": "pt", "name": "Portuguese"},
            {"code": "zh", "name": "Chinese"},
            {"code": "ja", "name": "Japanese"},
            {"code": "ko", "name": "Korean"},
            {"code": "ar", "name": "Arabic"},
            {"code": "ru", "name": "Russian"},
        ]
    }


def get_language_name(code):
    languages = get_language_support()["languages"]
    for language in languages:
        if language["code"] == code:
            return language["name"]
        return None
