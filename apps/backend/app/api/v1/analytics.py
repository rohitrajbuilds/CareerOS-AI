from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.schemas.analytics_api import AnalyticsSummaryResponse
from app.services.analytics_service import get_analytics_summary

router = APIRouter()


@router.get("/summary", response_model=AnalyticsSummaryResponse)
async def analytics_summary_route(
    db: AsyncSession = Depends(get_db),
) -> AnalyticsSummaryResponse:
    return await get_analytics_summary(db)
