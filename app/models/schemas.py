from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
import re

class UserSignup(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    tc_no: str = Field(..., min_length=11, max_length=11)
    full_name: str

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

    @field_validator("tc_no")
    @classmethod
    def validate_tc_no(cls, v: str) -> str:
        if not v.isdigit():
            raise ValueError("TC No must contain only digits.")
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# --- Profiles ---
class Profile(BaseModel):
    id: str
    tc_no: str
    full_name: str

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    # email and tc_no are excluded by business logic

# --- Products ---
class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None

# --- Inventory ---
class InventoryChange(BaseModel):
    # This was the old InventoryUpdate
    product_id: str
    change_amount: int
    reason: str

class InventoryUpdate(BaseModel):
    # Used for PATCH /inventory/{product_id}
    stock_quantity: int
    reason: Optional[str] = "Manual Adjustment"

# --- Orders ---
class OrderItem(BaseModel):
    product_id: str
    quantity: int
    unit_price_at_sale: float

class OrderCreate(BaseModel):
    items: List[OrderItem]
    customer_id: str

class OrderUpdate(BaseModel):
    status: str  # e.g., "pending", "shipped", "delivered"

class ShippingCreate(BaseModel):
    order_id: str
    carrier_name: str
    tracking_number: str
    status: str
    estimated_delivery: Optional[str] = None

class ShippingUpdate(BaseModel):
    carrier_name: Optional[str] = None
    tracking_number: Optional[str] = None
    status: Optional[str] = None
    estimated_delivery: Optional[str] = None

# --- Shadow Profiles ---
class ShadowProfileCreate(BaseModel):
    session_id: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
