from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.core.config import get_settings
from app.db.database import get_db_session

router = APIRouter(prefix="/assistant", tags=["Assistant"])
settings = get_settings()

class FarmerContextLocation(BaseModel):
    district: str
    upazila: str
    union: str

class FarmerContextPlot(BaseModel):
    plotId: str
    area: str
    areaUnit: str
    soilType: str
    currentCrop: str

class FarmerContextIntent(BaseModel):
    topics: List[str]
    otherIntent: str

class FarmerContextInfo(BaseModel):
    name: str
    role: str
    phone: str

class FarmerContext(BaseModel):
    farmer: FarmerContextInfo
    location: FarmerContextLocation
    plot: FarmerContextPlot
    intent: FarmerContextIntent

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    context: FarmerContext
    message: str
    history: List[ChatMessage]

class ChatResponse(BaseModel):
    answer: str
    scientificData: Optional[Dict[str, Any]] = None
    cropRecommendation: Optional[List[Dict[str, str]]] = None

@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(request: ChatRequest):
    scientific_data = None
    crop_recs = None
    
    # Fake backend data retrieval based on Plot ID
    if request.context.plot.plotId:
        plot_id = request.context.plot.plotId
        hash_val = sum(ord(c) for c in plot_id)
        base_ec = 3.5 + (hash_val % 45) / 10.0
        
        scientific_data = {
            "ec": round(base_ec, 1),
            "risk": "High" if base_ec > 6 else "Moderate" if base_ec > 4 else "Low",
            "forecast": {
                "d30": round(base_ec + 0.6, 1),
                "d60": round(base_ec + 1.2, 1),
                "d90": round(base_ec + 1.8, 1)
            }
        }
        
        if "চাষ" in request.message or "crop" in request.message.lower() or "ফসল" in request.message:
            crop_recs = [
                {"name": "BRRI Dhan 67 (Rice)", "suitability": "Highly Suitable"},
                {"name": "Sunflower (Rabi)", "suitability": "Suitable"}
            ]

    # DEMO mode fallback if API keys are not present
    if settings.demo_mode or not settings.groq_api_key:
        answer = f"আমি বুঝতে পারছি, {request.context.farmer.name} ভাই। "
        if request.context.plot.plotId:
            answer += f"আপনার {request.context.plot.plotId} জমির জন্য বর্তমান EC {scientific_data['ec']} dS/m। "
            if crop_recs:
                answer += "আপনার জমির বর্তমান অবস্থার জন্য আমি কিছু লবণসহিষ্ণু ফসলের তালিকা দিচ্ছি।"
            else:
                answer += "আগামী ৯০ দিনে আপনার জমির লবণাক্ততা বাড়তে পারে, তাই সেচ ব্যবস্থাপনায় সতর্ক হতে হবে।"
        else:
            answer += "আপনার জমির নির্দিষ্ট Plot ID দিলে আমি সঠিক বৈজ্ঞানিক তথ্য দিয়ে সাহায্য করতে পারব।"
        
        return ChatResponse(
            answer=answer + "\n\n(এটি ডেমো উত্তর। লাইভ মডেলে রিয়েল-টাইম AI পরামর্শ দেওয়া হবে।)",
            scientificData=scientific_data,
            cropRecommendation=crop_recs
        )
    
    # Real LLM Call using Groq
    try:
        import groq
        client = groq.AsyncGroq(api_key=settings.groq_api_key)
        
        system_prompt = f"""
        You are SalinO-Crop Assistant, an agricultural advisory assistant for coastal Bangladesh.
        Answer in simple Bengali.
        
        Farmer Name: {request.context.farmer.name}
        District: {request.context.location.district}
        Plot: {request.context.plot.plotId}
        
        Scientific Facts (DO NOT HALLUCINATE):
        EC: {scientific_data['ec'] if scientific_data else 'Unknown'}
        Risk: {scientific_data['risk'] if scientific_data else 'Unknown'}
        """
        
        messages = [{"role": "system", "content": system_prompt}]
        for msg in request.history:
            messages.append({"role": msg.role, "content": msg.content})
        messages.append({"role": "user", "content": request.message})
        
        response = await client.chat.completions.create(
            model="llama-3.1-70b-versatile",
            messages=messages,
            temperature=0.3,
            max_tokens=512,
        )
        answer = response.choices[0].message.content
        
        return ChatResponse(
            answer=answer,
            scientificData=scientific_data,
            cropRecommendation=crop_recs
        )
    except Exception as e:
        return ChatResponse(
            answer=f"দুঃখিত, এই মুহূর্তে উত্তর দিতে সমস্যা হচ্ছে: {str(e)}",
            scientificData=scientific_data
        )
