"""
SQLite Database Storage Manager for Crypto Auto Publisher
Stores Blurt accounts, AI provider keys, Prompt templates, Publish history, and Scheduler settings.
"""
import sqlite3
import os
from datetime import datetime

DB_PATH = "crypto_publisher.db"

class DatabaseManager:
    def __init__(self, db_path=DB_PATH):
        self.db_path = db_path
        self._init_db()

    def _get_connection(self):
        return sqlite3.connect(self.db_path)

    def _init_db(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            # Accounts table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS blurt_accounts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    posting_key TEXT NOT NULL,
                    is_active INTEGER DEFAULT 0,
                    default_community TEXT DEFAULT 'blurt-139531',
                    connection_status TEXT DEFAULT 'Connected'
                )
            ''')

            # AI Providers table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS ai_providers (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE NOT NULL,
                    api_key TEXT,
                    model TEXT,
                    temperature REAL DEFAULT 0.7,
                    max_tokens INTEGER DEFAULT 4096,
                    is_enabled INTEGER DEFAULT 1,
                    is_default INTEGER DEFAULT 0
                )
            ''')

            # Publish History table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS publish_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    publish_date TEXT NOT NULL,
                    publish_time TEXT NOT NULL,
                    account TEXT NOT NULL,
                    community TEXT NOT NULL,
                    title TEXT NOT NULL,
                    status TEXT NOT NULL,
                    url TEXT
                )
            ''')

            # Prompts table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS prompt_profiles (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE NOT NULL,
                    system_prompt TEXT,
                    article_prompt TEXT,
                    image_prompt TEXT,
                    seo_prompt TEXT,
                    tag_prompt TEXT,
                    coin_prompt TEXT
                )
            ''')

            conn.commit()
            self._seed_defaults()

    def _seed_defaults(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            # Seed default AI providers
            providers = [
                ('Google Gemini', os.environ.get('GEMINI_API_KEY', ''), 'gemini-3.5-flash', 0.7, 4096, 1, 1),
                ('OpenAI', '', 'gpt-4o', 0.7, 4096, 1, 0),
                ('Grok', '', 'grok-2-latest', 0.7, 4096, 1, 0)
            ]
            for p in providers:
                cursor.execute('''
                    INSERT OR IGNORE INTO ai_providers (name, api_key, model, temperature, max_tokens, is_enabled, is_default)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', p)

            # Seed default prompt profile
            default_sys = "You are an elite cryptocurrency financial analyst and journalist writing for Blurt.blog."
            default_art = """Crypto Market Update – {date}\n\nIntroduction\n\nBitcoin section\n{btc_chart}\n\nEthereum section\n{eth_chart}\n\nSolana section\n{sol_chart}\n\nDogecoin section\n{doge_chart}\n\nFinal market summary"""
            cursor.execute('''
                INSERT OR IGNORE INTO prompt_profiles (name, system_prompt, article_prompt, image_prompt, seo_prompt, tag_prompt, coin_prompt)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', ('Standard Professional Profile', default_sys, default_art, 'Futuristic 3D crypto bull market trading dashboard banner', 'Write SEO optimized crypto news', 'cryptocurrency blurt crypto bitcoin news trading', 'BTC,ETH,SOL,DOGE'))

            conn.commit()

if __name__ == "__main__":
    db = DatabaseManager()
    print("Database initialized successfully.")
