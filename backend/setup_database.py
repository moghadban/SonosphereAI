import os
import subprocess
import sys

# =========================================================
# === PREREQUISITE: CHECK/INSTALL GDOWN ===================
# =========================================================
try:
    # Attempt to import gdown
    import gdown

    print("'gdown' library is available.")
except ImportError:
    # If import fails, attempt to install it
    print("The 'gdown' library is not installed. Attempting to install...")
    try:
        # Use subprocess to run 'pip install gdown'
        subprocess.check_call([sys.executable, "-m", "pip", "install", "gdown"])

        # Now that it's installed, import it
        import gdown

        print("'gdown' installed successfully.")
    except Exception as e:
        # Handle installation errors
        print(f"Error installing gdown: {e}")
        print("Please install it manually: pip install gdown")
        sys.exit(1)

# =========================================================
# === CONFIGURATION: FILE ID ==============================
# =========================================================
# The Google Drive File ID for the lyrics corpus database.
DRIVE_FILE_ID = "1dH4wl9wJul1zph1HD0LHsNlBw66rg9Dz"
# =========================================================

TARGET_FILE_NAME = "lyrics_corpus.db"
# Define the target path relative to the script's location (assuming script is run from the project root)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TARGET_DIR = os.path.normpath(os.path.join(BASE_DIR, "../frontend/static/lyrics_corpora"))
TARGET_PATH = os.path.join(TARGET_DIR, TARGET_FILE_NAME)


def setup_database():
    """Ensures the target directory exists and downloads the database using gdown."""
    # Note: The gdown import/install check now happens outside of this function
    # but before the function is called, ensuring gdown is available here.

    print("=" * 60)
    print("📦 Lyrics Database Setup Initiated")
    print(f"File ID: {DRIVE_FILE_ID}")
    print(f"Target Path: {TARGET_PATH}")
    print("=" * 60)

    print(f"Ensuring target directory exists: {TARGET_DIR}")
    os.makedirs(TARGET_DIR, exist_ok=True)

    if os.path.exists(TARGET_PATH):
        file_size = os.path.getsize(TARGET_PATH)
        # Check if file is reasonably large (e.g., > 1 MB) to avoid redownloading small error files
        if file_size > 1024 * 1024:
            print(f"'{TARGET_FILE_NAME}' already exists (Size: {file_size / (1024 * 1024):.2f} MB). Skipping download.")
            return

        print(
            f"WARNING: '{TARGET_FILE_NAME}' exists but is small ({file_size / 1024:.2f} KB). Re-downloading to ensure file integrity.")
        os.remove(TARGET_PATH)

    try:
        # Use gdown to handle the download, including token bypass and redirection
        gdown.download(
            id=DRIVE_FILE_ID,
            output=TARGET_PATH,
            quiet=False  # Shows download progress
        )
        print("\n[SUCCESS] Database setup complete! You can now run the application.")
    except Exception as e:
        print("-" * 60)
        print(f"[ERROR] An error occurred during download using gdown: {e}")
        # The prerequisites check handles the gdown install, so the error here is likely
        # a connectivity or file permission issue.
        print(
            "Please check your internet connection, file permissions, or the Google Drive File ID.")
        print("-" * 60)
        sys.exit(1)


if __name__ == "__main__":
    setup_database()
