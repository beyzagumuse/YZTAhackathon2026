from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
import re

class UserSignup(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str
    role: str = "kayıtlıuser"  # EKLENDİ: admin, kayıtlıuser veya anonimuser

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if not re.search(r'[A-Z]', v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not re.search(r'[a-z]', v):
            raise ValueError("Password must contain at least one lowercase letter.")
        if not re.search(r'\d', v):
            raise ValueError("Password must contain at least one number.")
        if not re.search(r'[^A-Za-z0-9]', v):
            raise ValueError("Password must contain at least one special character.")
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# --- Profiles ---
class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None

# --- Products ---
class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock_quantity: int = 0         
    min_threshold: int = 10         

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock_quantity: Optional[int] = None
    min_threshold: Optional[int] = None

# --- Inventory ---
class InventoryChange(BaseModel):
    product_id: str
    change_amount: int
    reason: str

class InventoryUpdate(BaseModel):
    stock_quantity: int
    reason: Optional[str] = "Manual Adjustment"

# --- Orders ---
class OrderItem(BaseModel):
    product_id: str
    quantity: int

class OrderCreate(BaseModel):
    items: List[OrderItem]
    customer_id: str

class OrderUpdate(BaseModel):
    status: str  

# --- Shadow Profiles (Misafir Kullanıcı) ---
class ShadowProfileCreate(BaseModel):
    session_id: str
    email: Optional[EmailStr] = None 
    phone: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None