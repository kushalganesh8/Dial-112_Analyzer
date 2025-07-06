from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import psycopg2
from psycopg2 import pool
import urllib.parse

from config.config import DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD

# URL encode the password to handle special characters like '@'
encoded_password = urllib.parse.quote_plus(DB_PASSWORD)

# Create SQLAlchemy engine
SQLALCHEMY_DATABASE_URL = f"postgresql://{DB_USER}:{encoded_password}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

# Create a connection pool for database connections
connection_pool = pool.SimpleConnectionPool(
    1, 10,
    host=DB_HOST,
    port=DB_PORT,
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD  # Use the original password for psycopg2 connection
)
