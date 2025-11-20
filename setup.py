from pathlib import Path

from setuptools import setup, find_packages

# Read README.md for long_description
this_directory = Path(__file__).parent
long_description = (this_directory / "READMEPYPI.md").read_text(encoding="utf-8")

setup(
    name="sonosphereai",
    version="1.1.1",
    description="AI-powered music generation engine for lyrics, vocals, and instrumentation.",
    long_description=long_description,
    long_description_content_type="text/markdown",
    author="Mojahed Ghadban",
    url="https://github.com/moghadban/SonosphereAI",
    packages=find_packages(exclude=("tests", "frontend", "docs")),
    include_package_data=True,
    python_requires=">=3.12,<3.13",
    install_requires=[
        "flask",
        "flask-cors",
        "tensorflow",
        "keras",
        "librosa",
        "numpy",
        "scikit-learn",
        "gTTS",
        "scamp",
        "transformers",
        "pydub",
        "boto3",
        "coqui-tts",
        "markovify",
        "pandas",
        "torch",
        "torchvision",
        "nltk",
        "gdown",
        "better-profanity",
        "denoiser",
        "noisereduce",
        "ffmpeg-python",
        "hf_xet",
    ],
    classifiers=[
        "Programming Language :: Python :: 3.12",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
)
