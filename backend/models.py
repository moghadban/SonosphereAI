from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, Conv2D, MaxPooling2D, Flatten
from tensorflow.keras.utils import to_categorical
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import librosa
import numpy as np

def create_note_editing_model():
    model = Sequential()
    model.add(Dense(64, activation='relu', input_shape=(5,)))
    model.add(Dropout(0.2))
    model.add(Dense(32, activation='relu'))
    model.add(Dropout(0.2))
    model.add(Dense(5))
    model.compile(loss='mean_squared_error', optimizer='adam')
    return model

def create_instrument_options_model():
    model = Sequential()
    model.add(Dense(64, activation='relu', input_shape=(5,)))
    model.add(Dropout(0.2))
    model.add(Dense(32, activation='relu'))
    model.add(Dropout(0.2))
    model.add(Dense(5))
    model.compile(loss='mean_squared_error', optimizer='adam')
    return model

def create_vocals_to_instrument_model():
    model = Sequential()
    model.add(Conv2D(32, (3, 3), activation='relu', input_shape=(128, 128, 1)))
    model.add(MaxPooling2D((2, 2)))
    model.add(Conv2D(64, (3, 3), activation='relu'))
    model.add(MaxPooling2D((2, 2)))
    model.add(Conv2D(128, (3, 3), activation='relu'))
    model.add(MaxPooling2D((2, 2)))
    model.add(Flatten())
    model.add(Dense(128, activation='relu'))
    model.add(Dropout(0.2))
    model.add(Dense(5))
    model.compile(loss='mean_squared_error', optimizer='adam')
    return model

def create_noise_reduction_model():
    model = Sequential()
    model.add(Conv2D(32, (3, 3), activation='relu', input_shape=(128, 128, 1)))
    model.add(MaxPooling2D((2, 2)))
    model.add(Conv2D(64, (3, 3), activation='relu'))
    model.add(MaxPooling2D((2, 2)))
    model.add(Conv2D(128, (3, 3), activation='relu'))
    model.add(MaxPooling2D((2, 2)))
    model.add(Flatten())
    model.add(Dense(128, activation='relu'))
    model.add(Dropout(0.2))
    model.add(Dense(5))
    model.compile(loss='mean_squared_error', optimizer='adam')
    return model

def prepare_data(file_path):
    data = []
    labels = []
    for file in file_path:
        y, sr = librosa.load(file)
        chroma_stft = librosa.feature.chroma_stft(y, sr)
        data.append(chroma_stft)
        labels.append(file.split('_')[0])
        encoder = LabelEncoder()
        labels = encoder.fit_transform(labels)
        labels = to_categorical(labels)
    return np.array(data), labels

def train_model(model, data, labels):
    X_train, X_test, y_train, y_test = train_test_split(data, labels, test_size=0.2)
    model.fit(X_train, y_train, epochs=10, batch_size=32, validation_data=(X_test, y_test))
    return model