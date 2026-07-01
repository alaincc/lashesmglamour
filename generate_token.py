import sys
from datetime import datetime, timedelta
from jose import jwt

SECRET_KEY = "luxe_super_secure_secret_key_change_me_in_production"
ALGORITHM = "HS256"

def create_token():
    expire = datetime.utcnow() + timedelta(minutes=60)
    to_encode = {"sub": "admin", "exp": expire}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

print(create_token())
