from base_models import UserBase, EventBase, CostBase, GroupBase, CostShareBase


# define top-level pydantic classes *with* relations
# based on the approach used here: https://www.gormanalysis.com/blog/many-to-many-relationships-in-fastapi/
class User(UserBase):
    # relationships
    owned_groups: list[GroupBase]
    joined_groups: list[GroupBase]

    events: list[EventBase]

    costs: list[CostBase]  # costs where user is payer
    cost_shares: list[CostShareBase]  # shares of costs where user is borrower


class Event(EventBase):
    # relationships
    # user relationship
    member_ids: list[int]
    members: list[UserBase]

    # group relationship
    group_id: int
    group: GroupBase


class CostShare(CostShareBase):
    # relationships
    cost_id: int
    cost: CostBase
    
    borrower_id: int
    borrower: UserBase


class Cost(CostBase):
    # relationships
    # payer relationship
    payer_id: int
    payer: UserBase

    # borrowers relationship through shares
    shares: list[CostShareBase]
    
    # group relationship
    group_id: int
    group: GroupBase


class Group(GroupBase):
    # relationships
    # creator relationship
    creator_id: int
    creator: UserBase

    # member relationship
    member_ids: list[int]
    members: list[UserBase]

    # event relationship
    event_ids: list[int]
    events: list[EventBase]

    # cost relationship
    cost_ids: list[int]
    costs: list[CostBase]
