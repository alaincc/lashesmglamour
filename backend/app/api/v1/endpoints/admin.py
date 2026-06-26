from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.core.security import verify_password, create_access_token, ALGORITHM
from backend.app.database.session import get_db, engine
from backend.app.models.models import Service as ServiceModel
from backend.app.schemas import schemas
from backend.app.services.square_sync import sync_square_data
from backend.app.services.cache import redis_client

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/admin/login")


def get_current_admin(token: str = Depends(oauth2_scheme)) -> str:
    """
    Dependency that verifies JWT token credentials
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None or username != settings.ADMIN_USERNAME:
            raise credentials_exception
        return username
    except JWTError:
        raise credentials_exception


@router.post("/login", response_model=schemas.Token)
def login(payload: schemas.AdminLogin):
    """
    Authenticates admin user credentials and returns JWT bearer token.
    """
    if payload.username != settings.ADMIN_USERNAME:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    
    # Hash password verify
    if not verify_password(payload.password, settings.ADMIN_PASSWORD_HASH):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=payload.username, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/sync")
async def trigger_manual_sync(admin_user: str = Depends(get_current_admin)):
    """
    Manually triggers catalog and staff details synchronization with Square API.
    """
    success = await sync_square_data()
    if not success:
        raise HTTPException(status_code=500, detail="Synchronization task failed")
    return {"status": "success", "message": "Manual sync executed successfully"}


@router.get("/status", response_model=schemas.APIStatus)
def get_api_status(db: Session = Depends(get_db)):
    """
    Returns diagnostic dashboard statistics representing database, caching, and credentials configurations.
    """
    db_connected = False
    try:
        db.execute("SELECT 1")
        db_connected = True
    except Exception:
        pass

    redis_connected = False
    cached_services_count = 0
    if redis_client:
        try:
            redis_client.ping()
            redis_connected = True
            # Check cached keys count
            keys = redis_client.keys("services:*")
            cached_services_count = len(keys)
        except Exception:
            pass

    return {
        "status": "healthy" if db_connected else "degraded",
        "database_connected": db_connected,
        "redis_connected": redis_connected,
        "cached_services_count": cached_services_count,
        "square_environment": settings.SQUARE_ENVIRONMENT
    }
