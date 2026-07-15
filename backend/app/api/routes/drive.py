import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File as FastAPIFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.models.folder import Folder
from app.models.file import File as FileModel
from app.models.audit_log import AuditLog
from app.schemas.drive import FolderCreate, FolderOut, FileOut, DriveListing
from app.services.storage import storage_service

router = APIRouter(prefix="/api/drive", tags=["drive"])


def _log(db: Session, user: User, action: str, target_type: str, target_id: str, details: str = ""):
    db.add(AuditLog(user_id=user.id, action=action, target_type=target_type, target_id=target_id, details=details))
    db.commit()


@router.get("", response_model=DriveListing)
def list_drive(
    folder_id: uuid.UUID | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    folders = db.query(Folder).filter(Folder.parent_id == folder_id).all()
    files = db.query(FileModel).filter(FileModel.folder_id == folder_id, FileModel.deleted_at.is_(None)).all()
    current = db.query(Folder).filter(Folder.id == folder_id).first() if folder_id else None
    return DriveListing(folders=folders, files=files, current_folder=current)


@router.post("/folders", response_model=FolderOut, status_code=201)
def create_folder(payload: FolderCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    folder = Folder(name=payload.name, parent_id=payload.parent_id, owner_id=user.id, department=user.department)
    db.add(folder)
    db.commit()
    db.refresh(folder)
    _log(db, user, "create", "folder", str(folder.id), payload.name)
    return folder


@router.delete("/folders/{folder_id}", status_code=204)
def delete_folder(folder_id: uuid.UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    folder = db.query(Folder).filter(Folder.id == folder_id).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    db.delete(folder)
    db.commit()
    _log(db, user, "delete", "folder", str(folder_id))


@router.post("/files", response_model=FileOut, status_code=201)
async def upload_file(
    folder_id: uuid.UUID | None = None,
    upload: UploadFile = FastAPIFile(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    content = await upload.read()
    key = storage_service.build_key(user.id, upload.filename)
    storage_service.save(key, content)

    file_record = FileModel(
        name=upload.filename,
        folder_id=folder_id,
        owner_id=user.id,
        storage_key=key,
        mime_type=upload.content_type,
        size_bytes=len(content),
    )
    db.add(file_record)
    db.commit()
    db.refresh(file_record)
    _log(db, user, "upload", "file", str(file_record.id), upload.filename)
    return file_record


@router.get("/files/{file_id}/download")
def download_file(file_id: uuid.UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    file_record = db.query(FileModel).filter(FileModel.id == file_id, FileModel.deleted_at.is_(None)).first()
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")

    content = storage_service.read(file_record.storage_key)
    _log(db, user, "download", "file", str(file_id), file_record.name)
    return StreamingResponse(
        io.BytesIO(content),
        media_type=file_record.mime_type or "application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{file_record.name}"'},
    )


@router.delete("/files/{file_id}", status_code=204)
def delete_file(file_id: uuid.UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    file_record = db.query(FileModel).filter(FileModel.id == file_id).first()
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")
    # Soft delete so it can be restored later (Module 1 requirement)
    file_record.deleted_at = datetime.utcnow()
    db.commit()
    _log(db, user, "delete", "file", str(file_id), file_record.name)
