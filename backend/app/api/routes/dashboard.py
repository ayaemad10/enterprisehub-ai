from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.models.folder import Folder
from app.models.file import File as FileModel
from app.models.license import License
from app.schemas.dashboard import DashboardStats

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardStats)
def get_dashboard(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    today = date.today()
    soon = today + timedelta(days=30)

    total_files = db.query(FileModel).filter(FileModel.deleted_at.is_(None)).count()
    total_folders = db.query(Folder).count()
    total_licenses = db.query(License).count()
    expired_licenses = db.query(License).filter(License.expiry_date < today).count()
    expiring_soon = db.query(License).filter(License.expiry_date >= today, License.expiry_date <= soon).count()
    storage_used = db.query(func.coalesce(func.sum(FileModel.size_bytes), 0)).filter(
        FileModel.deleted_at.is_(None)
    ).scalar()
    files_today = db.query(FileModel).filter(func.date(FileModel.created_at) == today).count()
    active_users = db.query(User).filter(User.is_active.is_(True)).count()

    return DashboardStats(
        total_files=total_files,
        total_folders=total_folders,
        total_licenses=total_licenses,
        expired_licenses=expired_licenses,
        expiring_soon_licenses=expiring_soon,
        storage_used_bytes=storage_used or 0,
        files_uploaded_today=files_today,
        active_users=active_users,
    )
