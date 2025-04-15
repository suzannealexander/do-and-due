from pydantic import BaseModel


# define base pydantic classes without relations
# these should never be used directly and are just
# used to prevent circular type errors for many-to-many relations
class UserBase(BaseModel):
    id: int
    name: str
    username: str
    password: str
    email: str
    photo_url: str

    class Config:
        orm_mode: bool = True


class EventBase(BaseModel):
    id: int
    name: str
    first_date: str
    first_time: str
    repeat_every: str | None

    class Config:
        orm_mode: bool = True


class CostBase(BaseModel):
    id: int
    name: str
    category: str
    amount: float
    date_added: str
    description: str | None

    class Config:
        orm_mode: bool = True


class CostShareBase(BaseModel):
    id: int
    amount: float
    is_paid: bool

    class Config:
        orm_mode: bool = True


class GroupBase(BaseModel):
    id: str
    name: str
    status: str
    expiration: str | None  # is there a better dtype for datetimes in pydantic?
    timezone: str  # all events/times in the group should use the reference timezone?

    class Config:
        orm_mode: bool = True
