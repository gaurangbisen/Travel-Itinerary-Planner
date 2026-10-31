from typing import List, Dict, Any
from app.models.schemas import (
    TripResponse,
    ItineraryDayResponse,
    ItineraryItemResponse,
    CostSummaryResponse,
    CostCategoryBreakdown,
    DayCostBreakdown,
    ItemType
)


def compute_cost_summary(
    trip: TripResponse,
    days: List[ItineraryDayResponse]
) -> CostSummaryResponse:
    category_totals: Dict[ItemType, float] = {
        "attraction": 0.0,
        "dining": 0.0,
        "accommodation": 0.0,
        "transport": 0.0,
        "activity": 0.0
    }
    category_counts: Dict[ItemType, int] = {
        "attraction": 0,
        "dining": 0,
        "accommodation": 0,
        "transport": 0,
        "activity": 0
    }
    
    day_breakdowns: List[DayCostBreakdown] = []
    total_cost = 0.0

    for day in days:
        day_total = 0.0
        for item in day.items:
            c = float(item.cost or 0.0)
            item_type = item.type
            if item_type in category_totals:
                category_totals[item_type] += c
                category_counts[item_type] += 1
            else:
                category_totals["activity"] += c
                category_counts["activity"] += 1
            day_total += c
            total_cost += c

        day_breakdowns.append(
            DayCostBreakdown(
                day_number=day.day_number,
                date=day.date,
                amount=round(day_total, 2)
            )
        )

    # Calculate categories list
    categories_list: List[CostCategoryBreakdown] = []
    for cat_name, amount in category_totals.items():
        pct = round((amount / total_cost * 100), 1) if total_cost > 0 else 0.0
        categories_list.append(
            CostCategoryBreakdown(
                category=cat_name,
                amount=round(amount, 2),
                percentage=pct,
                item_count=category_counts[cat_name]
            )
        )

    # Sort categories by descending amount
    categories_list.sort(key=lambda x: x.amount, reverse=True)

    budget = float(trip.budget or 1000.0)
    is_over = total_cost > budget
    over_amount = round(total_cost - budget, 2) if is_over else 0.0
    remaining = round(budget - total_cost, 2) if not is_over else 0.0
    travelers = max(1, trip.travelers or 1)
    per_person = round(total_cost / travelers, 2)

    warning_msg = None
    if is_over:
        warning_msg = (
            f"Itinerary is currently ${over_amount:.2f} over your total ${budget:.2f} budget. "
            "Consider swapping premium dining or locking budget activities."
        )

    return CostSummaryResponse(
        trip_id=trip.id,
        budget=budget,
        total_cost=round(total_cost, 2),
        remaining_budget=remaining,
        is_over_budget=is_over,
        over_budget_amount=over_amount,
        per_person_cost=per_person,
        travelers_count=travelers,
        currency=trip.budget_currency or "USD",
        categories=categories_list,
        days=day_breakdowns,
        warning_message=warning_msg
    )
