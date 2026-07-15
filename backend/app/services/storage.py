"""
Storage abstraction so the rest of the app doesn't care whether files
live on local disk (dev) or in MinIO/S3 (staging/production).
Controlled by STORAGE_BACKEND=local|s3 in .env
"""
import os
import uuid
from pathlib import Path

from app.core.config import settings


class StorageService:
    def __init__(self) -> None:
        self.backend = settings.STORAGE_BACKEND
        if self.backend == "s3":
            import boto3

            self._client = boto3.client(
                "s3",
                endpoint_url=settings.S3_ENDPOINT_URL,
                aws_access_key_id=settings.S3_ACCESS_KEY,
                aws_secret_access_key=settings.S3_SECRET_KEY,
                region_name=settings.S3_REGION,
            )
            self._ensure_bucket()
        else:
            self._root = Path(settings.LOCAL_STORAGE_PATH)
            self._root.mkdir(parents=True, exist_ok=True)

    def _ensure_bucket(self) -> None:
        existing = [b["Name"] for b in self._client.list_buckets().get("Buckets", [])]
        if settings.S3_BUCKET_NAME not in existing:
            self._client.create_bucket(Bucket=settings.S3_BUCKET_NAME)

    def build_key(self, owner_id: uuid.UUID, filename: str) -> str:
        return f"{owner_id}/{uuid.uuid4()}_{filename}"

    def save(self, key: str, content: bytes) -> None:
        if self.backend == "s3":
            self._client.put_object(Bucket=settings.S3_BUCKET_NAME, Key=key, Body=content)
        else:
            path = self._root / key
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(content)

    def read(self, key: str) -> bytes:
        if self.backend == "s3":
            obj = self._client.get_object(Bucket=settings.S3_BUCKET_NAME, Key=key)
            return obj["Body"].read()
        else:
            path = self._root / key
            return path.read_bytes()

    def delete(self, key: str) -> None:
        if self.backend == "s3":
            self._client.delete_object(Bucket=settings.S3_BUCKET_NAME, Key=key)
        else:
            path = self._root / key
            if path.exists():
                os.remove(path)


storage_service = StorageService()
