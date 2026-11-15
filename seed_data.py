import os
import sys

# Add backend directory to sys.path so all imports inside backend resolve cleanly
backend_dir = os.path.join(os.path.dirname(__file__), "backend")
sys.path.insert(0, backend_dir)
os.chdir(backend_dir)

from seed_data import seed_database

if __name__ == "__main__":
    seed_database()

