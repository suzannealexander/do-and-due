from django.urls import path
from .views import (RegisterUser, LoginView, CreateGroup, IndexView, AddUsersToGroup, ViewGroup,
                   CreateEvent, CurrentUserView, ChangeEventMembers, MarkEventComplete,
                   UpdateCostShareStatus)

urlpatterns = [
    path('', IndexView.as_view(), name='index'),
    path('register/', RegisterUser.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('get-current-user/', CurrentUserView.as_view(), name='get-current-user'),
    path('group/create/', CreateGroup.as_view(), name='create_group'),
    path('group/add_users/', AddUsersToGroup.as_view(), name='add_group'),
    path('group/view/', ViewGroup.as_view(), name='view_group'),
    path('event/create/', CreateEvent.as_view(), name='create_event'),
    path('event/change_members/', ChangeEventMembers.as_view(), name='change_event_members'),
    path('event/complete/', MarkEventComplete.as_view(), name='mark_event_complete'),
    # Cost-related endpoints
    path('cost/share/update/', UpdateCostShareStatus.as_view(), name='update_cost_share'),
]
