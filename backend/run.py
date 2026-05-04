import subprocess
import time
import os
import signal
import sys

def run_servers():
    """
    Launches both the FastAPI AI Chatbot and the legacy Flask Backend.
    """
    print("="*50)
    print("🚀 LAUNCHING MULTI-SERVICE BACKEND")
    print("="*50)

    # 1. Start FastAPI on Port 8000
    print("\n[1/2] Starting FastAPI AI Chatbot on http://127.0.0.1:8000 ...")
    # Using 'python -m uvicorn' to ensure it uses the current environment's uvicorn
    fastapi_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--port", "8000", "--reload", "--log-level", "info"],
        cwd=os.getcwd()
    )

    # 2. Start Flask on Port 5000
    print("\n[2/2] Starting Flask Legacy Backend on http://127.0.0.1:5000 ...")
    flask_proc = subprocess.Popen(
        [sys.executable, "app.py"],
        cwd=os.getcwd()
    )

    print("\n" + "="*50)
    print("✅ BOTH SERVICES ARE RUNNING")
    print("Press Ctrl+C to stop both servers.")
    print("="*50 + "\n")

    try:
        # Keep the script alive while processes are running
        while True:
            time.sleep(1)
            # Check if any process has crashed
            if fastapi_proc.poll() is not None:
                print("❌ FastAPI server stopped unexpectedly.")
                break
            if flask_proc.poll() is not None:
                print("❌ Flask server stopped unexpectedly.")
                break
    except KeyboardInterrupt:
        print("\n\n🛑 Stopping servers...")
    finally:
        # Graceful shutdown
        fastapi_proc.terminate()
        flask_proc.terminate()
        print("👋 Servers stopped. Goodbye!")

if __name__ == "__main__":
    run_servers()
