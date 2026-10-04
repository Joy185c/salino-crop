"""
SalinO-Crop — Database Seed Script

Seeds:
1. Coastal districts (Satkhira, Khulna, Bagerhat, Barguna, Patuakhali)
2. Demo plots for each district
3. Crop variety database from data/crops/varieties.json

Run: python scripts/seed_db.py
"""
import asyncio
import json
import sys
import uuid
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from sqlalchemy import select
from app.db.database import AsyncSessionLocal
from app.db.models import (
    CropVariety,
    District,
    Plot,
    SeasonType,
    ToleranceCategory,
    Upazila,
)

COASTAL_DISTRICTS = [
    {"name": "Satkhira", "name_bn": "সাতক্ষীরা", "code": "SAT", "division": "Khulna"},
    {"name": "Khulna", "name_bn": "খুলনা", "code": "KHU", "division": "Khulna"},
    {"name": "Bagerhat", "name_bn": "বাগেরহাট", "code": "BAG", "division": "Khulna"},
    {"name": "Barguna", "name_bn": "বরগুনা", "code": "BAR", "division": "Barisal"},
    {"name": "Patuakhali", "name_bn": "পটুয়াখালী", "code": "PAT", "division": "Barisal"},
]

DEMO_UPAZILAS = {
    "SAT": [
        {"name": "Shyamnagar", "name_bn": "শ্যামনগর", "code": "SAT-SHY"},
        {"name": "Kalaroa", "name_bn": "কালারোয়া", "code": "SAT-KAL"},
        {"name": "Tala", "name_bn": "তালা", "code": "SAT-TAL"},
    ],
    "KHU": [
        {"name": "Dacope", "name_bn": "দাকোপ", "code": "KHU-DAC"},
        {"name": "Koyra", "name_bn": "কয়রা", "code": "KHU-KOY"},
    ],
    "BAG": [
        {"name": "Mongla", "name_bn": "মংলা", "code": "BAG-MON"},
        {"name": "Sarankhola", "name_bn": "শরণখোলা", "code": "BAG-SAR"},
    ],
    "BAR": [
        {"name": "Patharghata", "name_bn": "পাথরঘাটা", "code": "BAR-PAT"},
        {"name": "Amtali", "name_bn": "আমতলী", "code": "BAR-AMT"},
    ],
    "PAT": [
        {"name": "Kalapara", "name_bn": "কলাপাড়া", "code": "PAT-KAL"},
        {"name": "Galachipa", "name_bn": "গলাচিপা", "code": "PAT-GAL"},
    ],
}

DEMO_PLOTS = {
    "SAT": [
        {"name": "Shyamnagar Plot A", "farmer_name": "Abdul Karim", "area_ha": 1.2},
        {"name": "Shyamnagar Plot B", "farmer_name": "Rina Begum", "area_ha": 0.8},
        {"name": "Kalaroa Plot 1", "farmer_name": "Manik Mia", "area_ha": 1.5},
    ],
    "KHU": [
        {"name": "Dacope Farm 1", "farmer_name": "Hasan Ali", "area_ha": 2.0},
        {"name": "Koyra Pilot Plot", "farmer_name": "Fatema Khanam", "area_ha": 1.1},
    ],
    "BAG": [
        {"name": "Mongla Char Plot", "farmer_name": "Jalal Uddin", "area_ha": 0.9},
    ],
    "BAR": [
        {"name": "Patharghata Farm A", "farmer_name": "Saleha Begum", "area_ha": 1.3},
    ],
    "PAT": [
        {"name": "Kalapara Coastal Plot", "farmer_name": "Rahim Mia", "area_ha": 1.7},
    ],
}


async def seed():
    async with AsyncSessionLocal() as session:
        print("Seeding districts...")
        district_map = {}
        for d in COASTAL_DISTRICTS:
            existing = await session.execute(
                select(District).where(District.code == d["code"])
            )
            if existing.scalar_one_or_none():
                print(f"  District {d['code']} already exists, skipping.")
                district_result = await session.execute(
                    select(District).where(District.code == d["code"])
                )
                district_map[d["code"]] = district_result.scalar_one()
                continue

            district = District(
                name=d["name"],
                name_bn=d["name_bn"],
                code=d["code"],
                division=d["division"],
                is_coastal=True,
            )
            session.add(district)
            await session.flush()
            district_map[d["code"]] = district
            print(f"  ✓ {d['name']} ({d['code']})")

        print("Seeding upazilas...")
        upazila_map = {}
        for dist_code, upazilas in DEMO_UPAZILAS.items():
            district = district_map[dist_code]
            for u in upazilas:
                existing = await session.execute(
                    select(Upazila).where(Upazila.code == u["code"])
                )
                if existing.scalar_one_or_none():
                    upazila_result = await session.execute(
                        select(Upazila).where(Upazila.code == u["code"])
                    )
                    upazila_map[u["code"]] = upazila_result.scalar_one()
                    continue
                upazila = Upazila(
                    name=u["name"],
                    name_bn=u["name_bn"],
                    code=u["code"],
                    district_id=district.id,
                )
                session.add(upazila)
                await session.flush()
                upazila_map[u["code"]] = upazila
                print(f"  ✓ {u['name']} ({u['code']})")

        print("Seeding demo plots...")
        for dist_code, plots in DEMO_PLOTS.items():
            district = district_map[dist_code]
            for p in plots:
                existing = await session.execute(
                    select(Plot).where(Plot.name == p["name"]).where(Plot.is_demo == True)
                )
                if existing.scalar_one_or_none():
                    continue
                plot = Plot(
                    name=p["name"],
                    district_id=district.id,
                    area_ha=p.get("area_ha"),
                    farmer_name=p.get("farmer_name"),
                    is_demo=True,
                )
                session.add(plot)
                print(f"  ✓ {p['name']}")

        print("Seeding crop varieties...")
        crop_file = Path(__file__).parent.parent / "data" / "crops" / "varieties.json"
        with open(crop_file, encoding="utf-8") as f:
            crops = json.load(f)

        for c in crops:
            existing = await session.execute(
                select(CropVariety).where(
                    CropVariety.crop_name == c["crop_name"],
                    CropVariety.variety == c["variety"],
                )
            )
            if existing.scalar_one_or_none():
                continue

            crop = CropVariety(
                crop_name=c["crop_name"],
                crop_name_bn=c["crop_name_bn"],
                variety=c["variety"],
                variety_bn=c.get("variety_bn", ""),
                max_ec_ds_m=c["max_ec_ds_m"],
                tolerance_category=ToleranceCategory(c["tolerance_category"]),
                season=SeasonType(c["season"]),
                water_requirement=c.get("water_requirement"),
                notes=c.get("notes"),
                notes_bn=c.get("notes_bn"),
                source_reference=c.get("source_reference"),
                is_halophyte=c.get("is_halophyte", False),
                is_active=True,
            )
            session.add(crop)
            print(f"  ✓ {c['crop_name']} - {c['variety']}")

        await session.commit()
        print("\n✅ Database seeding complete.")


if __name__ == "__main__":
    asyncio.run(seed())
