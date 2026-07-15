from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_files: int
    total_folders: int
    total_licenses: int
    expired_licenses: int
    expiring_soon_licenses: int  # within next 30 days
    storage_used_bytes: int
    files_uploaded_today: int
    active_users: int
