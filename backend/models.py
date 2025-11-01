from tensorflow.keras.models import Sequential, Model
from tensorflow.keras.layers import (
    Dense, Dropout, Conv2D, MaxPooling2D, Flatten, Input,
    Conv2DTranspose, UpSampling2D, BatchNormalization
)
from tensorflow.keras.utils import to_categorical
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import librosa
import numpy as np

# --- Configuration Constants (Define these based on your dataset) ---
# Assuming 5 features for note editing (pitch, volume, duration, start, end)
NOTE_INPUT_FEATURES = 5
# CNN input shape based on 40 MFCCs (height) and 128 time frames (width), 1 channel
CNN_INPUT_SHAPE = (40, 128, 1)
# Replace these with the actual number of classes in your data
NUM_INSTRUMENTS = 7  # e.g., based on your INSTRUMENTS list
NUM_CLASSES = 15  # Total classes for vocal-to-instrument classification


# --- 1. Note Editing Model (Improved Regression) ---
def Notes_editing_model():
    """
    Model for predicting note parameter changes (Regression).
    Input: Current note state (5 features). Output: 5 modified parameters.
    """
    model = Sequential()
    # Increased layer size and added BatchNormalization for stability
    model.add(Dense(128, activation='relu', input_shape=(NOTE_INPUT_FEATURES,)))
    model.add(BatchNormalization())
    model.add(Dropout(0.3))
    model.add(Dense(64, activation='relu'))
    model.add(Dropout(0.3))
    # Output layer size 5 matches the expected note parameters
    model.add(Dense(5, activation='linear'))
    model.compile(loss='mean_squared_error', optimizer='adam')
    return model


# --- 2. Instrument Options Model (Fixed Classification) ---
def create_instrument_options_model():
    """
    Model for classifying audio clips into predefined instrument options.
    Input shape is adapted to match the CNN models using the same feature set.
    """
    model = Sequential()
    model.add(Conv2D(32, (3, 3), activation='relu', input_shape=CNN_INPUT_SHAPE))
    model.add(MaxPooling2D((2, 2)))
    model.add(Flatten())
    model.add(Dense(128, activation='relu'))
    model.add(Dropout(0.2))
    # FIXED: Softmax activation and categorical cross-entropy for classification
    model.add(Dense(NUM_INSTRUMENTS, activation='softmax'))
    model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])
    return model


# --- 3. Vocals to Instrument Model (Fixed Classification) ---
def create_vocals_to_instrument_model():
    """
    Model for classifying the quality/type of vocals or target instrument (Classification).
    """
    model = Sequential()
    model.add(Conv2D(32, (3, 3), activation='relu', input_shape=CNN_INPUT_SHAPE))
    model.add(MaxPooling2D((2, 2)))
    model.add(Conv2D(64, (3, 3), activation='relu'))
    model.add(MaxPooling2D((2, 2)))
    model.add(Flatten())
    model.add(Dense(128, activation='relu'))
    model.add(Dropout(0.2))
    # FIXED: Softmax activation and categorical cross-entropy for classification
    model.add(Dense(NUM_CLASSES, activation='softmax'))
    model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])
    return model


# --- 4. Noise Reduction Model (Autoencoder/Spectral Mapping) ---
def create_noise_reduction_model():
    """
    Model using an Autoencoder structure for noise reduction (spectral mapping).
    Input and Output shapes must match (Input Spectrogram -> Output Clean Spectrogram).
    """
    input_img = Input(shape=CNN_INPUT_SHAPE)

    # Encoder
    x = Conv2D(32, (3, 3), activation='relu', padding='same')(input_img)
    x = MaxPooling2D((2, 2), padding='same')(x)
    x = Conv2D(64, (3, 3), activation='relu', padding='same')(x)
    encoded = MaxPooling2D((2, 2), padding='same')(x)

    # Decoder
    x = Conv2D(64, (3, 3), activation='relu', padding='same')(encoded)
    x = UpSampling2D((2, 2))(x)
    x = Conv2D(32, (3, 3), activation='relu', padding='same')(x)
    x = UpSampling2D((2, 2))(x)

    # Output: Must match input shape (40, 128, 1)
    decoded = Conv2D(1, (3, 3), activation='sigmoid', padding='same')(x)

    autoencoder = Model(input_img, decoded)
    # Loss: MSE to compare noisy spectrogram (input) to target clean spectrogram (output)
    autoencoder.compile(optimizer='adam', loss='mean_squared_error')
    return autoencoder


# --- 5. Data Preparation (Fixed Logic) ---
def prepare_data(file_paths, target_sr=22050):
    """
    Extracts MFCC features and correctly encodes labels for classification models.
    Features are padded/cropped to a fixed size for CNN input.
    """
    data = []
    labels = []

    # 1. Extract features and labels
    for file in file_paths:
        y, sr = librosa.load(file, sr=target_sr)

        # Use 40 MFCCs as the feature set
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40)

        # Simple padding/cropping to target 128 frames (CRUCIAL for CNN fixed input)
        MAX_PADDING = 128
        if mfccs.shape[1] > MAX_PADDING:
            mfccs = mfccs[:, :MAX_PADDING]
        else:
            # Pad with zeros
            mfccs = np.pad(mfccs, ((0, 0), (0, MAX_PADDING - mfccs.shape[1])),
                           mode='constant')

        # Reshape to (Height, Width, Channel) = (40, 128, 1)
        data.append(np.expand_dims(mfccs, axis=-1))

        # Assuming label is the prefix of the filename (e.g., 'piano_01.wav' -> 'piano')
        labels.append(file.split('_')[0])

    data = np.array(data)

    # 2. Encode labels (OUTSIDE THE LOOP)
    encoder = LabelEncoder()
    integer_encoded = encoder.fit_transform(labels)

    # Convert to one-hot encoding for classification tasks
    labels_encoded = to_categorical(integer_encoded)

    return data, labels_encoded


# --- 6. Training Function ---
def train_model(model, data, labels):
    """Trains the given model and returns the fitted model."""
    # Ensure data is correctly shaped for the model (e.g., handling regression vs. CNN)

    X_train, X_test, y_train, y_test = train_test_split(data, labels, test_size=0.2)

    history = model.fit(
        X_train,
        y_train,
        epochs=10,
        batch_size=32,
        validation_data=(X_test, y_test),
        verbose=1
    )
    return model
