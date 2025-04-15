# from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from django.contrib.auth import login
from django.http import JsonResponse
from django.utils.dateparse import parse_datetime
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from chore_tracker.models import Group, Event, EventOccurrence, Cost, CostShare
from datetime import datetime
import json
from json import JSONDecodeError

User = get_user_model()


class IndexView(APIView):
    """ Index View """

    def get(self, request):
        return JsonResponse({'message': 'Welcome to Chore Tracker'})


class RegisterUser(APIView):
    """ User Registration """

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')

        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'Username already exists'}, status=400)

        if User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Email already in use'}, status=400)

        try:
            User.objects.create_user(username=username, email=email, password=password)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

        return JsonResponse({'message': 'User registered successfully'}, status=201)


@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    """ User Login with JWT in Cookies """

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        # case-insensitive username check
        user = User.objects.filter(username__iexact=username).first()

        if user and user.check_password(password):

            login(request, user)
            refresh = RefreshToken.for_user(user)
            response = JsonResponse({
                'message': 'Login successful',
                'refresh': str(refresh),
                'access': str(refresh.access_token)
            })

            return response
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=401)


class CreateGroup(APIView):
    """ Create a Group """

    def post(self, request):


        name = request.data.get('groupName')
        status = request.data.get('groupStatus')
        expiration_raw = request.data.get('groupExpiration')
        expiration = parse_datetime(expiration_raw) if expiration_raw else None
        timezone = request.data.get('groupTimezone')
        creator = request.data.get('groupCreatorId')
        user = User.objects.get(id=creator)
        # creator = request.user
        print(creator)


        try:
            group = Group(
                name=name,
                status=status,
                expiration=expiration,
                timezone=timezone,

            )
            group.creator = user
            group.save()

            group.members.add(user)
            group.save()
            
            return JsonResponse({'message': 'Group created successfully'}, status=201)
        except Exception as e:
            print(e)
            return JsonResponse({'error': 'Failed to create group'}, status=500)
        # except ValidationError as e:
        #     return JsonResponse({'error': str(e)}, status=400)
        # except Exception as e:
        #     return JsonResponse({'error': 'Failed to create group: ' + str(e)}, status=500)


class ViewGroup(APIView):
    """ View a Group """

    def get(self, request):
        group_id = request.query_params.get('group_id')

        try:
            group = Group.objects.get(id=group_id)
            members = group.members.all()
            events = group.events.all().prefetch_related('costs__shares__borrower')

            # Prepare events data with costs
            events_data = []
            for event in events:
                # Get costs for this event
                event_costs_data = []
                for cost in event.costs.all():
                    shares_data = []
                    for share in cost.shares.all():
                        shares_data.append({
                            'id': share.id,
                            'amount': share.amount,
                            'isPaid': share.is_paid,
                            'borrower': {
                                'username': share.borrower.username,
                                'photoUrl': share.borrower.photo_url
                            }
                        })
                    
                    event_costs_data.append({
                        'id': cost.id,
                        'name': cost.name,
                        'category': cost.category,
                        'amount': cost.amount,
                        'dateAdded': cost.date_added.isoformat(),
                        'description': cost.description,
                        'payer': {
                            'username': cost.payer.username,
                            'photoUrl': cost.payer.photo_url
                        },
                        'shares': shares_data
                    })
                
                events_data.append({
                    'id': event.id,
                    'name': event.name,
                    'first_date': event.first_date.isoformat() if hasattr(event.first_date, 'isoformat') else str(event.first_date),
                    'repeat_every': event.repeat_every,
                    'is_complete': event.is_complete,
                    'costs': event_costs_data
                })

            return JsonResponse({
                'group': {
                    'id': group.id,
                    'name': group.name,
                    'status': group.status,
                    'expiration': group.expiration,
                    'timezone': group.timezone,
                    'creator': group.creator.username,
                    'members': [member.username for member in members],
                    'events': events_data,
                }
            }, status=200)
        except Group.DoesNotExist:
            return JsonResponse({'error': 'Group not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': 'Failed to view group: ' + str(e)}, status=500)


class AddUsersToGroup(APIView):
    """ Add Users to a Group """

    def post(self, request):
        group_id = request.data.get('group_id')
        usernames = request.data.get('usernames', [])

        if not usernames:
            return JsonResponse({'error': 'No usernames provided'}, status=400)

        try:
            group = Group.objects.get(id=group_id)

            # Track status for each username
            result = {
                'success': [],
                'not_found': []
            }

            # Get existing members usernames for efficient lookup
            existing_members = set(group.members.values_list('username', flat=True))

            # Process each username individually
            for username in usernames:
                try:
                    user = User.objects.get(username=username)
                    if username in existing_members:
                        continue  # Skip if user is already a member
                    else:
                        group.members.add(user)
                        result['success'].append(username)
                except User.DoesNotExist:
                    result['not_found'].append(username)

            return JsonResponse({
                'message': 'Operation completed',
                'results': result
            }, status=200 if result['success'] else 404)

        except Group.DoesNotExist:
            return JsonResponse({'error': 'Group not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': f'Failed to invite users: {str(e)}'}, status=500)


class CreateEvent(APIView):
    """ Create an Event with optional cost """

    def post(self, request):
        try:
            data = json.loads(request.body)

            # We have to check if the group exists before trying to create the event
            try:
                group = Group.objects.get(id=data.get("groupId"))
            except Group.DoesNotExist:
                return JsonResponse(
                    {"success": False, "message": "No such Group"}, status=400
                )

            event = Event.objects.create(
                # ID should be created automatically
                name=data.get("name"),
                # Need to determine date format
                first_date=datetime.strptime(
                    data.get("date"), "%Y-%m-%d"
                ).date(),
                # first_time=datetime.strptime(
                #     data.get("date"), "%Y-%m-%d %H:%M:%S"
                # ).time(),
                repeat_every=data.get("repeatEvery") if "repeatEvery" in data else None,
                group=group,
            )

            # Get assigned members and add them. This is required due to the ManyToManyField
            group_members = group.members.all()
            memberNames = data.get("memberNames", [])
            event_members = []  # Keep track of event members for cost assignment

            for username in memberNames:
                try:
                    user = User.objects.get(username=username)

                    if user in group_members:
                        event.members.add(user)
                        event_members.append(user)
                    else:
                        return JsonResponse(
                            {"success": False, "message": f"User {username} not in group"}, status=400
                        )
                    
                except User.DoesNotExist:
                    return JsonResponse(
                        {"success": False, "message": f"User {username} not found"}, status=400
                    )
                
            # Process cost information if provided
            cost_data = data.get("cost")
            if cost_data:
                try:
                    # Find the payer
                    payer_username = cost_data.get("payerUsername")
                    try:
                        payer = User.objects.get(username=payer_username)
                        if payer not in group_members:
                            return JsonResponse(
                                {"success": False, "message": f"Payer {payer_username} not in group"}, status=400
                            )
                    except User.DoesNotExist:
                        return JsonResponse(
                            {"success": False, "message": f"Payer {payer_username} not found"}, status=400
                        )

                    # Create the cost
                    cost = Cost.objects.create(
                        name=cost_data.get("name"),
                        category=cost_data.get("category"),
                        amount=cost_data.get("amount"),
                        description=cost_data.get("description"),
                        event=event,
                        payer=payer
                    )

                    # Add cost shares
                    shares = cost_data.get("shares", [])
                    total_share_amount = 0
                    
                    for share_data in shares:
                        username = share_data.get("username")
                        share_amount = share_data.get("amount")
                        
                        if username is None or share_amount is None:
                            return JsonResponse(
                                {"success": False, "message": "Invalid share data: missing username or amount"}, status=400
                            )
                        
                        try:
                            borrower = User.objects.get(username=username)
                            
                            if borrower not in group_members:
                                return JsonResponse(
                                    {"success": False, "message": f"User {username} is not a member of the group"}, status=400
                                )
                            
                            CostShare.objects.create(
                                cost=cost,
                                borrower=borrower,
                                amount=share_amount,
                                is_paid=False
                            )
                            
                            total_share_amount += float(share_amount)
                            
                        except User.DoesNotExist:
                            return JsonResponse(
                                {"success": False, "message": f"Borrower {username} does not exist"}, status=400
                            )
                    
                    # Validate that the sum of shares equals the total cost amount
                    if abs(total_share_amount - float(cost_data.get("amount"))) > 0.01:  # Allow small rounding error
                        return JsonResponse(
                            {"success": False, "message": f"Sum of shares ({total_share_amount}) does not equal total cost amount ({cost_data.get('amount')})"}, status=400
                        )
                        
                except Exception as e:
                    return JsonResponse(
                        {"success": False, "message": f"Error creating cost: {str(e)}"}, status=400
                    )

            return JsonResponse({"success": True, "message": "Event created successfully"}, status=200)

        except JSONDecodeError:
            return JsonResponse(
                {"success": False, "message": "Invalid JSON in request"}, status=400
            )
        

class ChangeEventMembers(APIView):
    """ Change who is assigned to an event """

    def post(self, request):

        try:
            data = json.loads(request.body)

            # Check that the group is valid
            try:
                group = Group.objects.get(id=data.get("groupId"))
            except Group.DoesNotExist:
                return JsonResponse(
                    {"success": False, "message": "No such Group"}, status=400
                )

            # Check if the event exists
            try:
                event = Event.objects.get(name=data.get("name"), group=group)
            except Event.DoesNotExist:
                return JsonResponse(
                    {"success": False, "message": "No such Event"}, status=400
                )

            # Check that members to assign exist and are in the group. Then, assign them
            group_members = group.members.all()
            memberNames = data.get("memberNames", [])
            
            for username in memberNames:
                try:
                    user = User.objects.get(username=username)

                    if not user in group_members:
                        return JsonResponse(
                            {"success": False, "message": f"User {username} not in group"}, status=400
                        )
                    
                except User.DoesNotExist:
                    return JsonResponse(
                        {"success": False, "message": f"User {username} not found"}, status=400
                    )
                
            event.members.set(memberNames)

            return JsonResponse({"success": True, "message": ""}, status=200)

        except JSONDecodeError:
            return JsonResponse(
                {"success": False, "message": "Invalid JSON in request"}, status=400
            )


class CurrentUserView(APIView):
    """ Fetches User Info for Auth """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.is_authenticated:
            user = request.user
            groups = Group.objects.filter(members__in=[user]).prefetch_related('events__costs__shares__borrower')

            group_data = []
            for group in groups:
                # Ensure events data is properly formatted and always exists
                events_data = []
                for event in group.events.all().prefetch_related('costs__shares__borrower'):
                    # Get costs for this event
                    event_costs_data = []
                    for cost in event.costs.all():
                        shares_data = []
                        for share in cost.shares.all():
                            shares_data.append({
                                'id': share.id,
                                'amount': share.amount,
                                'isPaid': share.is_paid,
                                'borrower': {
                                    'username': share.borrower.username,
                                    'photoUrl': share.borrower.photo_url
                                }
                            })
                        
                        event_costs_data.append({
                            'id': cost.id,
                            'name': cost.name,
                            'category': cost.category,
                            'amount': cost.amount,
                            'dateAdded': cost.date_added.isoformat(),
                            'description': cost.description,
                            'payer': {
                                'username': cost.payer.username,
                                'photoUrl': cost.payer.photo_url
                            },
                            'shares': shares_data
                        })
                    
                    events_data.append({
                        'id': event.id,
                        'name': event.name,
                        'first_date': event.first_date.isoformat() if hasattr(event.first_date, 'isoformat') else str(event.first_date),
                        'repeat_every': event.repeat_every,
                        'is_complete': event.is_complete,
                        'costs': event_costs_data
                    })
                
                group_data.append({
                    'id': group.id,
                    'name': group.name,
                    'members': list(group.members.all().values('username', 'photo_url')),
                    'events': events_data  # Always include events array, even if empty
                })

            return JsonResponse({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'groups': group_data
            })
        
class MarkEventComplete(APIView):
    def post(self, request):
        try:
            data = json.loads(request.body)

            # Check that the event exists
            try:
                event = Event.objects.get(id=data.get("eventId"))
            except Event.DoesNotExist:
                return JsonResponse(
                    {"success": False, "message": "No such Event"}, status=400
                )

            #Toggle event completion status
            if event.is_complete:
                event.is_complete = False
            else:
                event.is_complete = True
            event.save()

            return JsonResponse({"success": True, "message": "event status updated", "eventStatus": event.is_complete}, status=200)
        
        except JSONDecodeError:
            return JsonResponse(
                {"success": False, "message": "Invalid JSON in request", "eventStatus": event.is_complete}, status=400
            )




class UpdateCostShareStatus(APIView):
    """ Update the paid status of a cost share """
    
    def post(self, request):
        try:
            data = json.loads(request.body)
            
            cost_share_id = data.get("costShareId")
            is_paid = data.get("isPaid")
            
            if cost_share_id is None or is_paid is None:
                return JsonResponse(
                    {"success": False, "message": "Missing required fields: costShareId or isPaid"}, status=400
                )
            
            try:
                cost_share = CostShare.objects.get(id=cost_share_id)
                cost_share.is_paid = is_paid
                cost_share.save()
                
                return JsonResponse(
                    {"success": True, "message": "Cost share status updated", "isPaid": cost_share.is_paid}, status=200
                )
            except CostShare.DoesNotExist:
                return JsonResponse(
                    {"success": False, "message": "Cost share does not exist"}, status=404
                )
                
        except JSONDecodeError:
            return JsonResponse(
                {"success": False, "message": "Invalid JSON in request"}, status=400
            )
        except Exception as e:
            return JsonResponse(
                {"success": False, "message": f"Error updating cost share: {str(e)}"}, status=500
            )



