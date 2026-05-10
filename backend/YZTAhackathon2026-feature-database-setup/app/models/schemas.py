from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List

class UserSignup(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    tc_no: Optional[str] = None
    address: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Profile(BaseModel):
    id: str
    full_name: str
    address: Optional[str] = None

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    address: Optional[str] = None

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None

class InventoryChange(BaseModel):
    product_id: str
    change_amount: int
    reason: str

class InventoryUpdate(BaseModel):
    stock_quantity: int
    reason: Optional[str] = "Manual Adjustment"

class OrderItem(BaseModel):
    product_id: str
    quantity: int
    unit_price_at_sale: float

class OrderCreate(BaseModel):
    items: List[OrderItem]
    customer_id: str
    address: Optional[str] = None

class OrderUpdate(BaseModel):
    status: str

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

class ShadowProfileCreate(BaseModel):
    session_id: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None