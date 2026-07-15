import uuid
from datetime import datetime

from pydantic import BaseModel


class FolderCreate(BaseModel):
    name: str
    parent_id: uuid.UUID | None = None


class FolderOut(BaseModel):
    id: uuid.UUID
    name: str
    parent_id: uuid.UUID | None
    owner_id: uuid.UUID
    department: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class FileOut(BaseModel):
    id: uuid.UUID
    name: str
    folder_id: uuid.UUID | None
    owner_id: uuid.UUID
    mime_type: str | None
    size_bytes: int
    version: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DriveListing(BaseModel):
    folders: list[FolderOut]
    files: list[FileOut]
    current_folder: FolderOut | None = None
